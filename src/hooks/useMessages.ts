"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { DecodedMessage } from "@xmtp/browser-sdk";
import type { ConversationItem } from "./useConversations";

interface UseMessagesReturn {
  messages: DecodedMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  isSending: boolean;
}

export function useMessages(
  conversation: ConversationItem | null
): UseMessagesReturn {
  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<{ end: () => Promise<unknown> } | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Load messages for a conversation
  const loadMessages = useCallback(async () => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await conversation.sync();
      const msgs = await conversation.messages();
      // Sort by sentAt ascending
      msgs.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
      setMessages(msgs);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load messages";
      setError(message);
      console.error("Load messages error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  // Stream new messages
  useEffect(() => {
    if (!conversation) return;

    // If conversation changed, reset
    if (conversationIdRef.current !== conversation.id) {
      conversationIdRef.current = conversation.id;
    }

    let cancelled = false;

    const startStream = async () => {
      // End previous stream
      if (streamRef.current) {
        await streamRef.current.end().catch(console.error);
        streamRef.current = null;
      }

      try {
        const stream = await conversation.stream({
          onValue: (message) => {
            if (!cancelled) {
              setMessages((prev) => {
                // Don't add duplicates
                if (prev.some((m) => m.id === message.id)) return prev;
                return [...prev, message];
              });
            }
          },
          onError: (err) => {
            console.error("Message stream error:", err);
          },
        });
        streamRef.current = stream;
      } catch (err) {
        console.error("Failed to start message stream:", err);
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
  }, [conversation]);

  // Load messages when conversation changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversation || !text.trim()) return;

      setIsSending(true);
      try {
        await conversation.sendText(text.trim());
        // The stream should pick up the new message, but also
        // refresh to be safe
        await conversation.sync();
        const msgs = await conversation.messages();
        msgs.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
        setMessages(msgs);
      } catch (err) {
        console.error("Send message error:", err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversation]
  );

  return { messages, isLoading, error, sendMessage, isSending };
}
