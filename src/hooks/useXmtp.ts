"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { Client } from "@xmtp/browser-sdk";
import { useGlobalWalletSignerClient } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { createXmtpClient } from "@/lib/xmtp";

export interface XmtpState {
  client: Client | null;
  isInitializing: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  disconnect: () => void;
}

export const XmtpContext = createContext<XmtpState>({
  client: null,
  isInitializing: false,
  error: null,
  initialize: async () => {},
  disconnect: () => {},
});

/**
 * Hook that manages XMTP client lifecycle — used by XmtpProvider.
 */
export function useXmtpClient(): XmtpState {
  const [client, setClient] = useState<Client | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  const { address } = useAccount();
  const { data: signerClient } = useGlobalWalletSignerClient();

  const initialize = useCallback(async () => {
    if (!address || !signerClient || initRef.current) return;

    initRef.current = true;
    setIsInitializing(true);
    setError(null);

    try {
      const xmtpClient = await createXmtpClient(address, signerClient);
      setClient(xmtpClient);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize XMTP";
      setError(message);
      console.error("XMTP init error:", err);
      initRef.current = false;
    } finally {
      setIsInitializing(false);
    }
  }, [address, signerClient]);

  const disconnect = useCallback(() => {
    if (client) {
      client.close();
    }
    setClient(null);
    setError(null);
    initRef.current = false;
  }, [client]);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!address && client) {
      disconnect();
    }
  }, [address, client, disconnect]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.close();
      }
    };
  }, [client]);

  return { client, isInitializing, error, initialize, disconnect };
}

/**
 * Hook to consume the XMTP context — used by child components.
 */
export function useXmtp(): XmtpState {
  return useContext(XmtpContext);
}
