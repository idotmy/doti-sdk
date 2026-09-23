# @doti-protocol/sdk

The official TypeScript/JavaScript SDK for **DotI (.i)** — Web3 Decentralized Identity and Multichain Domain Name Service.

[![npm version](https://img.shields.io/npm/v/@doti-protocol/sdk.svg)](https://www.npmjs.com/package/@doti-protocol/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Features

- 🌐 **Forward Resolution**: Resolve `.i` domains to EVM wallet addresses (`alice.i` -> `0x...`).
- 🔄 **Reverse Lookup**: Query the primary `.i` domain for any wallet address (`0x...` -> `alice.i`).
- 📝 **Text Records**: Query decentralized profile records (`avatar`, `twitter`, `github`, `email`, `url`, etc.).
- 🔗 **Multichain Address Resolution**: SLIP-0044 multicoin address resolution across Ethereum, Arbitrum, Optimism, Robinhood, and custom chains.
- 🚀 **Runtime Extensible**: Dynamically register and query new EVM chains without waiting for SDK updates.
- 🪶 **Lightweight & Fast**: Powered by modern [viem](https://viem.sh) with zero unnecessary bloat.

---

## 📦 Installation

```bash
npm install @doti-protocol/sdk viem
# or
yarn add @doti-protocol/sdk viem
# or
pnpm add @doti-protocol/sdk viem
```

---

## 🚀 Quickstart

```typescript
import { createDotIClient } from '@doti-protocol/sdk';

// Initialize the client
const doti = createDotIClient();

async function main() {
  // 1. Forward Resolution (Name to Address)
  const address = await doti.resolveName('alex.i');
  console.log('Resolved Address:', address); // 0x...

  // 2. Reverse Lookup (Address to Name)
  const name = await doti.lookupAddress('0xf853F8243F10a57CF5e43A49F156F132c05C21a6');
  console.log('Primary Domain:', name); // alex.i

  // 3. Text Records
  const avatar = await doti.getTextRecord('alex.i', 'avatar');
  const twitter = await doti.getTextRecord('alex.i', 'twitter');
  console.log('Avatar:', avatar);
  console.log('Twitter:', twitter);

  // 4. Full Profile Metadata
  const profile = await doti.getProfile('alex.i');
  console.log('Domain Profile:', profile);
}

main();
```

---

## 🌐 Multichain & Custom Chain Support

DotI natively indexes on **Arbitrum One (42161)** as the primary authority chain, while supporting cross-chain resolution for **Optimism (10)**, **Ethereum Mainnet (1)**, **Robinhood Chain (4663)**, and more.

### Adding or Customizing Chains Dynamically:

```typescript
import { createDotIClient } from '@doti-id/sdk';

const doti = createDotIClient({
  // Custom RPC URLs
  rpcUrls: {
    42161: 'https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  },
});

// Register or override an EVM chain dynamically at runtime:
doti.registerChain({
  chainId: 4663,
  name: 'Robinhood Chain',
  rpcUrl: 'https://rpc.mainnet.chain.robinhood.com',
  registryAddress: '0xf853F8243F10a57CF5e43A49F156F132c05C21a6',
});
```

---

## 🛠️ API Reference

### `createDotIClient(options?: DotIClientOptions)`
Creates a new `DotIClient` instance.

#### Options:
- `authorityChainId?: number` (Default: `42161` - Arbitrum One)
- `rpcUrls?: Record<number, string>` (Custom RPC mapping by chain ID)
- `customChains?: ChainConfig[]` (Additional networks to register)

### Client Methods:
- `resolveName(name: string): Promise<0x${string} | null>`
- `lookupAddress(address: string): Promise<string | null>`
- `getTextRecord(name: string, key: string): Promise<string | null>`
- `getMulticoinAddress(name: string, coinTypeOrChainId: number): Promise<string | null>`
- `getOwner(name: string): Promise<0x${string} | null>`
- `getProfile(name: string, textKeys?: string[]): Promise<DomainProfile | null>`
- `registerChain(config: ChainConfig): void`
- `getSupportedChains(): ChainConfig[]`

---

## 📜 License

MIT © [DotI Name Service](https://doti.my)
