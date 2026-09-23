import { createDotIClient } from '../src';

/**
 * Quickstart Example for DotI Protocol SDK
 * Run with: npx tsx examples/quickstart.ts
 */
async function main() {
  console.log('--- DotI (.i) Domain Protocol SDK Demo ---');

  // Initialize the client (defaults to Arbitrum One authority)
  const doti = createDotIClient();

  // 1. Forward Resolution: Resolve .i name to EVM wallet address
  const targetName = 'alex.i';
  console.log(`\nResolving "${targetName}"...`);
  const resolvedAddress = await doti.resolveName(targetName);
  console.log(`-> Address: ${resolvedAddress ?? 'Not found'}`);

  // 2. Reverse Lookup: Look up primary name for address
  if (resolvedAddress) {
    console.log(`\nReverse looking up address "${resolvedAddress}"...`);
    const primaryName = await doti.lookupAddress(resolvedAddress);
    console.log(`-> Primary Domain: ${primaryName ?? 'Not found'}`);
  }

  // 3. Text Records Query (Socials, Avatar, Bio)
  console.log(`\nFetching text records for "${targetName}"...`);
  const avatar = await doti.getTextRecord(targetName, 'avatar');
  const twitter = await doti.getTextRecord(targetName, 'twitter');
  console.log(`-> Avatar: ${avatar ?? 'None'}`);
  console.log(`-> Twitter: ${twitter ?? 'None'}`);

  // 4. Multicoin Address Lookup (e.g. SLIP-0044 ETH / OP / Robinhood)
  console.log(`\nFetching OP Mainnet address for "${targetName}"...`);
  const opAddress = await doti.getMulticoinAddress(targetName, 10);
  console.log(`-> OP Address: ${opAddress ?? 'Not configured'}`);

  console.log('\n--- Demo Completed ---');
}

main().catch(console.error);
