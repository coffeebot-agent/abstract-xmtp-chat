"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ConversationItem } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import { truncateAddress } from "@/lib/utils";

interface ChatViewProps {
  conversation: ConversationItem | null;
  clientInboxId: string | undefined;
  onBack?: () => void;
}

export function ChatView({ conversation, clientInboxId, onBack }: ChatViewProps) {
  const { messages, isLoading, sendMessage, isSending } =
    useMessages(conversation);
  const [inputText, setInputText] = useState("");
  const [peerAddress, setPeerAddress] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve peer address
  useEffect(() => {
    const resolvePeer = async () => {
      if (!conversation) {
        setPeerAddress("");
        return;
      }
      try {
        const members = await conversation.members();
        const peer = members.find(
          (m) => m.inboxId !== clientInboxId
        );
        if (peer && peer.accountIdentifiers.length > 0) {
          setPeerAddress(peer.accountIdentifiers[0].identifier);
        } else {
          setPeerAddress("Unknown");
        }
      } catch {
        setPeerAddress("Unknown");
      }
    };
    resolvePeer();
  }, [conversation, clientInboxId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversation) {
      inputRef.current?.focus();
    }
  }, [conversation]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText("");
    try {
      await sendMessage(text);
    } catch {
      setInputText(text);
    }
  }, [inputText, isSending, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          Select a conversation
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-[280px]">
          Choose an existing conversation or start a new one to begin messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {/* Back button for mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="sm:hidden p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <div className="w-9 h-9 rounded-full bg-[var(--color-accent-bg)] border border-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--color-accent)] text-xs font-bold">
            {peerAddress ? peerAddress.slice(2, 4).toUpperCase() : "??"}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {peerAddress ? truncateAddress(peerAddress) : "Loading…"}
          </p>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[11px] text-[var(--color-accent)]">
              End-to-end encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
              <div className="w-5 h-5 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
              <span className="text-sm">Loading messages…</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                No messages yet. Say hello!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSender={msg.senderInboxId === clientInboxId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            disabled={isSending}
            className="flex-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl
                       px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]
                       focus:outline-none focus:border-[var(--color-accent)]/40 focus:ring-1 focus:ring-[var(--color-accent)]/20
                       transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl
                       bg-[var(--color-accent)] text-black transition-all duration-200
                       hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed
                       active:scale-95 cursor-pointer"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
