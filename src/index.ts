import dotenv from "dotenv";
import { dot, moonbeam, polkadot } from "@moonbeam-network/xcm-config";
import { Sdk, TransferData } from "@moonbeam-network/xcm-sdk";
import { Keyring } from "@polkadot/api";
import {
  cryptoWaitReady,
  ed25519PairFromSeed,
  mnemonicToMiniSecret,
  mnemonicValidate,
} from "@polkadot/util-crypto";
import { ethers } from "ethers";
import { setTimeout } from "node:timers/promises";
import { Keypair } from "@polkadot/util-crypto/types";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function getPolkadotKeyPair() {
  console.log("Getting Polkadot key pair...");
  // const polkadotPrivateKey = process.env.MOONBEAM_PRIVATE_KEY;

  const mnemonic = process.env.MNEMONIC;
  const isValidMnemonic = mnemonicValidate(mnemonic);
  console.log(`Mnemonic is valid: ${isValidMnemonic}`);

  await cryptoWaitReady();
  console.log("Crypto is ready");
  const keyring = new Keyring({
    ss58Format: polkadot.ss58Format,
    type: "sr25519",
  });
  const pair = keyring.createFromUri(mnemonic);
  console.log(`Polkadot address: ${pair.address}`);
  return pair;
}

// ===========================================================================

// export function logBalances(data: TransferData): void {
//   console.log(
//     `Balance on ${data.source.chain.name} ${data.source.balance.toDecimal()} ${
//       data.source.balance.symbol
//     }`
//   );
//   console.log(
//     `Balance on ${
//       data.destination.chain.name
//     } ${data.destination.balance.toDecimal()} ${
//       data.destination.balance.symbol
//     }`
//   );
// }

// export function logTxDetails(data: TransferData): void {
//   console.log(
//     `\nYou can send min: ${data.min.toDecimal()} ${
//       data.min.symbol
//     } and max: ${data.max.toDecimal()} ${data.max.symbol} from ${
//       data.source.chain.name
//     } to ${
//       data.destination.chain.name
//     }. You will pay ${data.source.fee.toDecimal()} ${
//       data.source.fee.symbol
//     } fee on ${
//       data.source.chain.name
//     } and ${data.destination.fee.toDecimal()} ${
//       data.destination.fee.symbol
//     } fee on ${data.destination.chain.name}.`
//   );
// }

// export async function fromPolkadot() {
//   console.log("\nTransfer from Polkadot to Moonbeam\n");

//   const pair = await getPolkadotKeyPair();

//   const data = await Sdk().getTransferData({
//     destinationAddress: ethersSigner.address,
//     destinationKeyOrChain: moonbeam,
//     keyOrAsset: dot,
//     polkadotSigner: pair,
//     sourceAddress: pair.address,
//     sourceKeyOrChain: polkadot,
//   });

//   logBalances(data);
//   logTxDetails(data);

//   const amount = +data.min.toDecimal() * 2;

//   console.log(`Sending from ${data.source.chain.name} amount: ${amount}`);

//   const hash = await data.transfer(amount);

//   console.log(`${data.source.chain.name} tx hash: ${hash}`);
// }

// export async function fromMoonbeam() {
//   console.log("\nTransfer from Moonbeam to Polkadot\n");

//   const data = await Sdk()
//     .assets()
//     .asset(dot)
//     .source(moonbeam)
//     .destination(polkadot)
//     .accounts(ethersSigner.address, pair.address, {
//       ethersSigner,
//     });

//   logBalances(data);
//   logTxDetails(data);

//   const amount = +data.min.toDecimal() * 2;

//   console.log(`Sending from ${data.source.chain.name} amount: ${amount}`);

//   const hash = await data.transfer(amount);

//   console.log(`${data.source.chain.name} tx hash: ${hash}`);
// }

async function main() {
  // Moonbeam Signer ===========================================================

  const moonbeamPrivateKey = process.env.MOONBEAM_PRIVATE_KEY;
  const provider = new ethers.providers.WebSocketProvider(moonbeam.ws, {
    chainId: moonbeam.id,
    name: moonbeam.name,
  });
  const ethersSigner = new ethers.Wallet(moonbeamPrivateKey, provider);
  console.log(`Moonbeam address: ${ethersSigner.address}`);

  // Polkadot Signer ===========================================================

  const mnemonic = process.env.MNEMONIC;
  const isValidMnemonic = mnemonicValidate(mnemonic);
  console.log(`Mnemonic is valid: ${isValidMnemonic}`);

  await cryptoWaitReady();
  console.log("Crypto is ready");
  const keyring = new Keyring({
    ss58Format: polkadot.ss58Format,
    type: "sr25519",
  });
  const pair = keyring.createFromUri(mnemonic);
  console.log(`Polkadot address: ${pair.address}`);

  console.log("Assets list");
  const assetsList = await Sdk().assets();
  console.log(JSON.stringify(assetsList, null, 2));

  const { assets, asset } = Sdk().assets();
  console.log(
    `The supported assets are: ${assets.map((asset) => asset.originSymbol)}`
  );

  console.log("Asset list");
  const assetList = Sdk().assets().asset("glmr");
  console.log(JSON.stringify(assetList, null, 2));

  const { sourceChains, source } = Sdk().assets().asset("glmr");
  console.log(
    `The supported source chains are: ${sourceChains.map(
      (chain) => chain.name
    )}`
  );

  console.log("Destination chains list");
  const destinationChainsList = Sdk().assets().asset("glmr").source("moonbeam");

  console.log(JSON.stringify(destinationChainsList, null, 2));

  const { destinationChains, destination } = Sdk()
    .assets()
    .asset("glmr")
    .source("moonbeam");
  console.log(
    `The supported destination chains are: ${destinationChains.map(
      (chain) => chain.name
    )}`
  );
  // disable unnecessary warning logs
  // console.warn = () => null;
  // console.clear();
  //   await getPolkadotKeyPair();

  //   console.log(`\nMoonbeam address: ${ethersSigner.address}.`);
  //   console.log(`Polkadot address: ${pair.address}.`);

  //   await fromPolkadot();
  //   await setTimeout(30000);
  //   await fromMoonbeam();
}

main()
  .then(() => console.log("done!"))
  .catch(console.error)
  .finally(() => process.exit());
