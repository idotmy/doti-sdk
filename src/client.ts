import {
  createPublicClient,
  http,
  PublicClient,
  isAddress,
} from 'viem';
import {
  DEFAULT_SUPPORTED_CHAINS,
  DEFAULT_AUTHORITY_CHAIN_ID,
  ZERO_ADDRESS,
} from './constants';
import {
  ChainConfig,
  DomainProfile,
  DotIClientOptions,
} from './types';
import {
  DOTI_REGISTRY_ABI,
  DOTI_RESOLVER_ABI,
} from './abi';
import {
  computeNamehash,
  computeReverseNode,
  normalizeDotIName,
  chainIdToCoinType,
  bytesToAddress,
} from './utils';

export class DotIClient {
  private authorityChainId: number;
  private chains: Map<number, ChainConfig>;
  private clients: Map<number, PublicClient>;

  constructor(options?: DotIClientOptions) {
    this.authorityChainId =
      options?.authorityChainId ?? DEFAULT_AUTHORITY_CHAIN_ID;
    this.chains = new Map();
    this.clients = new Map();

    // 1. Initialize default supported chains
    for (const [id, config] of Object.entries(DEFAULT_SUPPORTED_CHAINS)) {
      const chainId = Number(id);
      const customRpc = options?.rpcUrls?.[chainId];
      this.chains.set(chainId, {
        ...config,
        rpcUrl: customRpc ?? config.rpcUrl,
      });
    }

    // 2. Add any runtime custom chains supplied in options
    if (options?.customChains) {
      for (const chain of options.customChains) {
        this.registerChain(chain);
      }
    }
  }

  /**
   * Register a new blockchain network dynamically at runtime
   */
  public registerChain(config: ChainConfig): void {
    this.chains.set(config.chainId, config);
    // Invalidate client cache if re-registering
    this.clients.delete(config.chainId);
  }

  /**
   * Returns all currently configured chain networks
   */
  public getSupportedChains(): ChainConfig[] {
    return Array.from(this.chains.values());
  }

  /**
   * Returns the PublicClient for a given chainId (cached)
   */
  private getClient(chainId: number): PublicClient {
    let client = this.clients.get(chainId);
    if (!client) {
      const config = this.chains.get(chainId);
      if (!config) {
        throw new Error(
          `Chain ID ${chainId} is not configured in DotIClient. Use client.registerChain() to add it.`
        );
      }

      client = createPublicClient({
        transport: http(config.rpcUrl),
      });
      this.clients.set(chainId, client);
    }
    return client;
  }

  /**
   * Resolves a DotI domain (.i) to its primary EVM wallet address
   * @param name The domain name (e.g. 'alice.i' or 'alice')
   */
  public async resolveName(name: string): Promise<`0x${string}` | null> {
    const authorityConfig = this.chains.get(this.authorityChainId);
    if (!authorityConfig) {
      throw new Error(`Authority chain ${this.authorityChainId} not found.`);
    }

    const client = this.getClient(this.authorityChainId);
    const node = computeNamehash(name);

    try {
      // 1. Get Resolver address from Registry contract
      const resolverAddress = (await client.readContract({
        address: authorityConfig.registryAddress,
        abi: DOTI_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      })) as `0x${string}`;

      if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
        return null;
      }

      // 2. Query target address from the Resolver
      const resolvedAddress = (await client.readContract({
        address: resolverAddress,
        abi: DOTI_RESOLVER_ABI,
        functionName: 'addr',
        args: [node],
      })) as `0x${string}`;

      if (!resolvedAddress || resolvedAddress === ZERO_ADDRESS) {
        return null;
      }

      return resolvedAddress;
    } catch (error) {
      return null;
    }
  }

  /**
   * Reverse look up an Ethereum/EVM wallet address to its primary DotI (.i) domain
   * @param address The 0x wallet address
   */
  public async lookupAddress(
    address: `0x${string}` | string
  ): Promise<string | null> {
    if (!isAddress(address)) {
      throw new Error(`Invalid EVM address: ${address}`);
    }

    const authorityConfig = this.chains.get(this.authorityChainId);
    if (!authorityConfig) return null;

    const client = this.getClient(this.authorityChainId);
    const reverseNode = computeReverseNode(address as `0x${string}`);

    try {
      // 1. Get Resolver for the reverse node
      const resolverAddress = (await client.readContract({
        address: authorityConfig.registryAddress,
        abi: DOTI_REGISTRY_ABI,
        functionName: 'resolver',
        args: [reverseNode],
      })) as `0x${string}`;

      if (!resolverAddress || resolverAddress === ZERO_ADDRESS) {
        return null;
      }

      // 2. Query name from Resolver
      const name = (await client.readContract({
        address: resolverAddress,
        abi: DOTI_RESOLVER_ABI,
        functionName: 'name',
        args: [reverseNode],
      })) as string;

      if (!name || name.trim() === '') {
        return null;
      }

      // 3. Verify forward resolution matches reverse to prevent spoofing
      const verifiedAddr = await this.resolveName(name);
      if (verifiedAddr?.toLowerCase() === address.toLowerCase()) {
        return normalizeDotIName(name);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Retrieves a text record (e.g. 'avatar', 'email', 'url', 'twitter', 'discord') for a DotI domain
   */
  public async getTextRecord(
    name: string,
    key: string
  ): Promise<string | null> {
    const authorityConfig = this.chains.get(this.authorityChainId);
    if (!authorityConfig) return null;

    const client = this.getClient(this.authorityChainId);
    const node = computeNamehash(name);

    try {
      const resolverAddress = (await client.readContract({
        address: authorityConfig.registryAddress,
        abi: DOTI_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      })) as `0x${string}`;

      if (!resolverAddress || resolverAddress === ZERO_ADDRESS) return null;

      const recordValue = (await client.readContract({
        address: resolverAddress,
        abi: DOTI_RESOLVER_ABI,
        functionName: 'text',
        args: [node, key],
      })) as string;

      return recordValue && recordValue.length > 0 ? recordValue : null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves multicoin address for a domain based on SLIP-0044 CoinType or Chain ID
   */
  public async getMulticoinAddress(
    name: string,
    coinTypeOrChainId: number
  ): Promise<string | null> {
    const authorityConfig = this.chains.get(this.authorityChainId);
    if (!authorityConfig) return null;

    const client = this.getClient(this.authorityChainId);
    const node = computeNamehash(name);
    const coinType = BigInt(
      coinTypeOrChainId > 0x80000000 || coinTypeOrChainId < 1000
        ? coinTypeOrChainId
        : chainIdToCoinType(coinTypeOrChainId)
    );

    try {
      const resolverAddress = (await client.readContract({
        address: authorityConfig.registryAddress,
        abi: DOTI_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      })) as `0x${string}`;

      if (!resolverAddress || resolverAddress === ZERO_ADDRESS) return null;

      const rawBytes = (await client.readContract({
        address: resolverAddress,
        abi: DOTI_RESOLVER_ABI,
        functionName: 'addr',
        args: [node, coinType],
      })) as `0x${string}`;

      if (!rawBytes || rawBytes === '0x') return null;

      return bytesToAddress(rawBytes);
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the owner address of a DotI domain
   */
  public async getOwner(name: string): Promise<`0x${string}` | null> {
    const authorityConfig = this.chains.get(this.authorityChainId);
    if (!authorityConfig) return null;

    const client = this.getClient(this.authorityChainId);
    const node = computeNamehash(name);

    try {
      const owner = (await client.readContract({
        address: authorityConfig.registryAddress,
        abi: DOTI_REGISTRY_ABI,
        functionName: 'owner',
        args: [node],
      })) as `0x${string}`;

      return owner && owner !== ZERO_ADDRESS ? owner : null;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves full profile metadata for a DotI domain
   */
  public async getProfile(
    name: string,
    textKeys: string[] = ['avatar', 'description', 'url', 'twitter', 'github', 'email']
  ): Promise<DomainProfile | null> {
    const normalized = normalizeDotIName(name);
    const node = computeNamehash(normalized);

    const [resolvedAddress, owner] = await Promise.all([
      this.resolveName(normalized),
      this.getOwner(normalized),
    ]);

    if (!resolvedAddress && !owner) {
      return null;
    }

    const records: Record<string, string> = {};
    await Promise.all(
      textKeys.map(async (key) => {
        const val = await this.getTextRecord(normalized, key);
        if (val) records[key] = val;
      })
    );

    return {
      name: normalized,
      node,
      owner,
      resolvedAddress,
      resolverAddress: null,
      records,
      multicoinAddresses: {},
    };
  }
}

/**
 * Factory function to create a new DotIClient instance
 */
export function createDotIClient(options?: DotIClientOptions): DotIClient {
  return new DotIClient(options);
}
