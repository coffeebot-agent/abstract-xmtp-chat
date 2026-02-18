"use client";

import React from "react";
import { truncateAddress, formatTimestamp } from "@/lib/utils";
import type { Dm, Group } from "@xmtp/browser-sdk";

type ConversationItem = Dm | Group;

interface ConversationMeta {
  conversation: ConversationItem;
  peerAddress: string;
  lastMessageText: string;
  lastMessageTime: Date | null;
}

interface ConversationListProps {
  conversations: ConversationMeta[];
  selectedId: string | null;
  onSelect: (conversation: ConversationItem, peerAddress: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  searchQuery,
  onSearchChange,
  isLoading,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] border-r border-white/[0.06]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white font-[family-name:var(--font-roobert)]">
            Messages
          </h2>
          <button
            onClick={onNewChat}
            className="p-2 rounded-lg bg-[#00FF85]/10 text-[#00FF85] hover:bg-[#00FF85]/20
                       transition-all duration-200"
            title="New conversation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg
                       text-sm text-white placeholder-white/20 outline-none
                       focus:border-[#00FF85]/20 transition-colors font-[family-name:var(--font-roobert)]"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin w-5 h-5 border-2 border-[#00FF85]/20 border-t-[#00FF85] rounded-full" />
              <span className="text-xs text-white/30">Loading...</span>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-sm text-white/40 font-[family-name:var(--font-roobert)]">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <p className="text-xs text-white/20 mt-1">
                Start a new chat to begin messaging
              </p>
            )}
          </div>
        ) : (
          conversations.map(({ conversation, peerAddress, lastMessageText, lastMessageTime }) => {
            const isSelected = selectedId === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation, peerAddress)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-150
                  ${
                    isSelected
                      ? "bg-[#00FF85]/[0.07] border-r-2 border-r-[#00FF85]"
                      : "hover:bg-white/[0.03]"
                  }
                `}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-[#00FF85]/20 border border-[#00FF85]/20"
                        : "bg-white/[0.06] border border-white/[0.06]"
                    }
                  `}
                >
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#00FF85]" : "text-white/40"
                    }`}
                  >
                    {peerAddress ? peerAddress.slice(2, 4).toUpperCase() : "??"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium font-mono truncate ${
                        isSelected ? "text-white" : "text-white/70"
                      }`}
                    >
                      {peerAddress ? truncateAddress(peerAddress, 5) : "Unknown"}
                    </span>
                    {lastMessageTime && (
                      <span className="text-[10px] text-white/25 flex-shrink-0 ml-2">
                        {formatTimestamp(lastMessageTime)}
                      </span>
                    )}
                  </div>
                  {lastMessageText && (
                    <p className="text-xs text-white/30 truncate mt-0.5">
                      {lastMessageText}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
