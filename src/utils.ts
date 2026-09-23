import { keccak256, toHex, stringToBytes, concat } from 'viem';
import { DOTI_TLD, ZERO_BYTES32 } from './constants';

/**
 * Validates whether a given domain name is a valid DotI (.i) name
 */
export function isValidDotIName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const formatted = name.trim().toLowerCase();
  const parts = formatted.split('.');

  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (tld !== 'i') return false;

  // Validate labels
  for (let i = 0; i < parts.length - 1; i++) {
    const label = parts[i];
    if (label.length === 0) return false;
    // Disallow invalid characters
    if (!/^[a-z0-9-_]+$/.test(label)) return false;
  }

  return true;
}

/**
 * Normalizes and formats a domain name with '.i' TLD
 */
export function normalizeDotIName(name: string): string {
  const clean = name.trim().toLowerCase();
  return clean.endsWith(DOTI_TLD) ? clean : `${clean}${DOTI_TLD}`;
}

/**
 * Computes the EIP-137 namehash for a given domain string
 */
export function computeNamehash(name: string): `0x${string}` {
  const normalized = normalizeDotIName(name);
  let node: `0x${string}` = ZERO_BYTES32;

  const labels = normalized.split('.').reverse();

  for (const label of labels) {
    if (!label) continue;
    const labelHash = keccak256(stringToBytes(label));
    node = keccak256(concat([node, labelHash]));
  }

  return node;
}

/**
 * Computes the reverse lookup node for an Ethereum/EVM address on '.addr.reverse'
 */
export function computeReverseNode(address: `0x${string}`): `0x${string}` {
  const cleanAddress = address.toLowerCase().replace('0x', '');
  const reverseName = `${cleanAddress}.addr.reverse`;
  return computeNamehash(reverseName);
}

/**
 * Calculates the SLIP-0044 coin type for an EVM chain ID (ENSIP-9)
 */
export function chainIdToCoinType(chainId: number): number {
  if (chainId === 1) return 60; // ETH
  return (0x80000000 | chainId) >>> 0;
}

/**
 * Decodes raw bytes to a checksummed or lowercase hex address
 */
export function bytesToAddress(bytes: `0x${string}` | Uint8Array): `0x${string}` {
  if (typeof bytes === 'string') {
    if (bytes.length === 42 && bytes.startsWith('0x')) {
      return bytes as `0x${string}`;
    }
    if (bytes.length > 42) {
      // Often returned as 32-byte padded address
      return `0x${bytes.slice(-40)}` as `0x${string}`;
    }
    return bytes as `0x${string}`;
  }
  return toHex(bytes) as `0x${string}`;
}
