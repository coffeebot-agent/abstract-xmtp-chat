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

export function useConversations(client: Client | null): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<{ end: () => Promise<unknown> } | null>(null);

  const loadConversations = useCallback(async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      // Sync from network first
      await client.conversations.sync();

      // List DMs (which are the main conversation type for 1:1 chat)
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

  // Stream new conversations
  useEffect(() => {
    if (!client) return;

    let cancelled = false;

    const startStream = async () => {
      try {
        const stream = await client.conversations.stream({
          onValue: (conversation) => {
            if (!cancelled) {
              setConversations((prev) => {
                // Don't add duplicates
                if (prev.some((c) => c.id === conversation.id)) return prev;
                return [conversation, ...prev];
              });
            }
          },
          onError: (err) => {
            console.error("Conversation stream error:", err);
          },
        });
        streamRef.current = stream;
      } catch (err) {
        console.error("Failed to start conversation stream:", err);
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
