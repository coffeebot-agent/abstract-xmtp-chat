import {
  Client,
  type Signer,
  IdentifierKind,
  type Identifier,
} from "@xmtp/browser-sdk";
import type { WalletClient } from "viem";
import { toBytes } from "viem";

/** Abstract chain ID */
const ABSTRACT_CHAIN_ID = BigInt(2741);

/**
 * Creates an XMTP SCW signer from an Abstract Global Wallet signer client.
 */
export function createXmtpSigner(
  address: `0x${string}`,
  walletClient: WalletClient
): Signer {
  return {
    type: "SCW",
    getIdentifier: () => ({
      identifier: address.toLowerCase(),
      identifierKind: IdentifierKind.Ethereum,
    }),
    signMessage: async (message: string) => {
      const signature = await walletClient.signMessage({
        account: address,
        message,
      });
      return toBytes(signature);
    },
    getChainId: () => ABSTRACT_CHAIN_ID,
  };
}

/**
 * Creates an XMTP client from an AGW signer.
 */
export async function createXmtpClient(
  address: `0x${string}`,
  walletClient: WalletClient
): Promise<Client> {
  const signer = createXmtpSigner(address, walletClient);
  const client = await Client.create(signer, {
    env: "production",
    appVersion: "abstract-xmtp-chat/1.0.0",
  });
  return client;
}

/**
 * Checks if a given address can receive XMTP messages.
 */
export async function canMessageAddress(
  address: string,
): Promise<boolean> {
  const identifier: Identifier = {
    identifier: address.toLowerCase(),
    identifierKind: IdentifierKind.Ethereum,
  };
  const result = await Client.canMessage([identifier], "production");
  return result.get(address.toLowerCase()) ?? false;
}

/**
 * Creates an Identifier object from an Ethereum address.
 */
export function addressToIdentifier(address: string): Identifier {
  return {
    identifier: address.toLowerCase(),
    identifierKind: IdentifierKind.Ethereum,
  };
}
