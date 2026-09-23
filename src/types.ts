export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  registryAddress: `0x${string}`;
  resolverAddress?: `0x${string}`;
  isAuthority?: boolean;
  coinType?: number;
}

export interface DotIClientOptions {
  /**
   * Authority Chain ID to query for registrations (default: 42161 - Arbitrum One)
   */
  authorityChainId?: number;

  /**
   * Custom RPC URLs mapping by chainId
   */
  rpcUrls?: Record<number, string>;

  /**
   * Custom or additional chain configurations
   */
  customChains?: ChainConfig[];

  /**
   * Timeout for RPC requests in milliseconds (default: 10000ms)
   */
  timeout?: number;
}

export interface DomainProfile {
  name: string;
  node: `0x${string}`;
  owner: `0x${string}` | null;
  resolvedAddress: `0x${string}` | null;
  resolverAddress: `0x${string}` | null;
  contentHash?: string | null;
  records: Record<string, string>;
  multicoinAddresses: Record<number | string, string>;
}

export interface TextRecordQuery {
  keys?: string[];
}
