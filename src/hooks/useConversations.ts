"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Client, Dm, Group } from "@xmtp/browser-sdk";
import { ConsentState } from "@xmtp/browser-sdk";

export type ConversationItem = Dm | Group;

interface UseConversationsReturn {
  conversations: ConversationItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useConversations(
  client: Client | null
): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<{ end: () => Promise<unknown> } | null>(null);

  const loadConversations = useCallback(async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      await client.conversations.sync();
      const allConversations = await client.conversations.list({
        consentStates: [ConsentState.Allowed, ConsentState.Unknown],
      });
      setConversations(allConversations);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(message);
      console.error("Load conversations error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  // Stream new conversations via async iterable
  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    const startStream = async () => {
      try {
        const stream = await client.conversations.stream();
        streamRef.current = stream;

        for await (const conversation of stream) {
          if (cancelled) break;
          setConversations((prev) => {
            if (prev.some((c) => c.id === conversation.id)) return prev;
            return [conversation, ...prev];
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Conversation stream error:", err);
        }
      }
    };

    startStream();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.end().catch(console.error);
        streamRef.current = null;
      }
    };
  }, [client]);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh: loadConversations,
  };
}
