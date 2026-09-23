import { ChainConfig } from './types';

/**
 * TLD for DotI Name Service
 */
export const DOTI_TLD = '.i';

/**
 * Base node hash for '.i' (EIP-137 namehash of 'i' on root)
 */
export const DOTI_BASE_NODE =
  '0x96b16e885d568c078028f8feef27a718c0e2a3cf42145b2100806cb1f07f4bb7' as const;

/**
 * Zero address constant
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Zero bytes32 constant
 */
export const ZERO_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

/**
 * Default Authority Chain ID (Arbitrum One)
 */
export const DEFAULT_AUTHORITY_CHAIN_ID = 42161;

/**
 * Standard SLIP-0044 Coin Types
 */
export const SLIP44_COIN_TYPES = {
  BITCOIN: 0,
  LITECOIN: 2,
  DOGECOIN: 3,
  ETHEREUM: 60,
  SOLANA: 501,
  POLYGON: 2147483785, // 0x80000000 | 137
  OPTIMISM: 2147483658, // 0x80000000 | 10
  ARBITRUM_ONE: 2147525809, // 0x80000000 | 42161
  BASE: 2147492101, // 0x80000000 | 8453
  ROBINHOOD: 2147488311, // 0x80000000 | 4663
} as const;

/**
 * Built-in chain configurations. Easily extensible at runtime.
 */
export const DEFAULT_SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  // Arbitrum One (Primary Authority)
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    registryAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    resolverAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    isAuthority: true,
    coinType: SLIP44_COIN_TYPES.ARBITRUM_ONE,
  },
  // OP Mainnet
  10: {
    chainId: 10,
    name: 'OP Mainnet',
    rpcUrl: 'https://mainnet.optimism.io',
    registryAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    resolverAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    isAuthority: false,
    coinType: SLIP44_COIN_TYPES.OPTIMISM,
  },
  // Ethereum Mainnet
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    registryAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    resolverAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    isAuthority: false,
    coinType: SLIP44_COIN_TYPES.ETHEREUM,
  },
  // Robinhood Chain
  4663: {
    chainId: 4663,
    name: 'Robinhood Chain',
    rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
    registryAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    resolverAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
    isAuthority: false,
    coinType: SLIP44_COIN_TYPES.ROBINHOOD,
  },
};
