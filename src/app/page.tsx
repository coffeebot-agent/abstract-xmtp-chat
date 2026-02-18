"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import type { Dm, Group } from "@xmtp/browser-sdk";
import { useXmtp } from "@/hooks/useXmtp";
import { useConversations } from "@/hooks/useConversations";
import { ConversationList } from "@/components/ConversationList";
import { ChatView } from "@/components/ChatView";
import { NewChatModal } from "@/components/NewChatModal";
import { SignInButton } from "@/components/wallet/SignInButton";
import { truncateAddress } from "@/lib/utils";
import { addressToIdentifier } from "@/lib/xmtp";

type ConversationItem = Dm | Group;

interface ConversationMeta {
  conversation: ConversationItem;
  peerAddress: string;
  lastMessageText: string;
  lastMessageTime: Date | null;
}

export default function Home() {
  const { address } = useAccount();
  const { client, isInitializing, error, initialize, disconnect } = useXmtp();
  const { conversations, isLoading: convsLoading } = useConversations(client);

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationItem | null>(null);
  const [, setSelectedPeerAddress] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [conversationMetas, setConversationMetas] = useState<
    ConversationMeta[]
  >([]);

  // Auto-initialize XMTP when wallet is connected
  useEffect(() => {
    if (address && !client && !isInitializing) {
      initialize();
    }
  }, [address, client, isInitializing, initialize]);

  // Disconnect XMTP when wallet disconnects
  useEffect(() => {
    if (!address && client) {
      disconnect();
      setSelectedConversation(null);
    }
  }, [address, client, disconnect]);

  // Resolve conversation metadata (peer address, last message)
  useEffect(() => {
    if (!client) {
      setConversationMetas([]);
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      const metas: ConversationMeta[] = [];

      for (const conv of conversations) {
        try {
          const members = await conv.members();
          const peer = members.find((m) => m.inboxId !== client.inboxId);
          const peerAddr =
            peer?.accountIdentifiers?.[0]?.identifier ?? "Unknown";

          await conv.sync();
          const msgs = await conv.messages({ limit: BigInt(1) });
          const lastMsg = msgs[msgs.length - 1];

          metas.push({
            conversation: conv,
            peerAddress: peerAddr,
            lastMessageText:
              typeof lastMsg?.content === "string" ? lastMsg.content : "",
            lastMessageTime: lastMsg?.sentAt ?? null,
          });
        } catch {
          metas.push({
            conversation: conv,
            peerAddress: "Unknown",
            lastMessageText: "",
            lastMessageTime: null,
          });
        }
      }

      if (!cancelled) {
        // Sort by most recent message first
        metas.sort((a, b) => {
          const ta = a.lastMessageTime?.getTime() ?? 0;
          const tb = b.lastMessageTime?.getTime() ?? 0;
          return tb - ta;
        });
        setConversationMetas(metas);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [client, conversations]);

  // Filter conversations by search
  const filteredMetas = useMemo(() => {
    if (!searchQuery.trim()) return conversationMetas;
    const q = searchQuery.toLowerCase();
    return conversationMetas.filter(
      (m) =>
        m.peerAddress.toLowerCase().includes(q) ||
        m.lastMessageText.toLowerCase().includes(q)
    );
  }, [conversationMetas, searchQuery]);

  const handleSelectConversation = useCallback(
    (conv: ConversationItem, peerAddress: string) => {
      setSelectedConversation(conv);
      setSelectedPeerAddress(peerAddress);
      setShowSidebar(false);
    },
    []
  );

  const handleCreateConversation = useCallback(
    async (peerAddr: string) => {
      if (!client) throw new Error("XMTP not initialized");

      const identifier = addressToIdentifier(peerAddr);
      const canMsg = await client.canMessage([identifier]);
      const canReach = canMsg.get(peerAddr.toLowerCase()) ?? false;

      if (!canReach) {
        throw new Error(
          "This address is not on the XMTP network yet. They need to initialize XMTP first."
        );
      }

      const conv = await client.conversations.createDmWithIdentifier(identifier);
      setSelectedConversation(conv);
      setSelectedPeerAddress(peerAddr);
      setShowSidebar(false);
    },
    [client]
  );

  // Not connected — show login
  if (!address) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <Image
            src="/abstract.svg"
            alt="Abstract"
            width={180}
            height={24}
            priority
          />
          <h1 className="text-2xl font-semibold font-[family-name:var(--font-roobert)]">
            XMTP Chat
          </h1>
          <p className="text-sm text-white/50 font-[family-name:var(--font-roobert)]">
            End-to-end encrypted messaging powered by Abstract Global Wallet and
            XMTP protocol.
          </p>
          <SignInButton />
          <div className="flex items-center gap-1.5 mt-2">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00FF85"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-[#00FF85]/60">
              All messages are end-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Connected but XMTP initializing
  if (isInitializing || (!client && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white gap-4">
        <div className="w-8 h-8 border-2 border-[#00FF85]/20 border-t-[#00FF85] rounded-full animate-spin" />
        <p className="text-sm text-white/50 font-[family-name:var(--font-roobert)]">
          Initializing XMTP...
        </p>
      </div>
    );
  }

  // XMTP error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white gap-4 px-6">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md text-center">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={initialize}
            className="px-4 py-2 bg-[#00FF85] text-black rounded-lg text-sm font-semibold
                       hover:bg-[#00CC6A] transition-colors font-[family-name:var(--font-roobert)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main chat UI
  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden"
        } sm:flex flex-col w-full sm:w-80 sm:min-w-80 flex-shrink-0`}
      >
        {/* User header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0D0D0D]">
          <div className="flex items-center gap-2.5">
            <Image
              src="/abs-green.svg"
              alt="Abstract"
              width={20}
              height={20}
            />
            <span className="text-xs text-white/40 font-mono">
              {truncateAddress(address)}
            </span>
          </div>
          <button
            onClick={disconnect}
            className="text-[10px] text-white/30 hover:text-white/60 transition-colors
                       font-[family-name:var(--font-roobert)]"
          >
            Disconnect
          </button>
        </div>

        <ConversationList
          conversations={filteredMetas}
          selectedId={selectedConversation?.id ?? null}
          onSelect={handleSelectConversation}
          onNewChat={() => setIsNewChatOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={convsLoading}
        />
      </div>

      {/* Chat area */}
      <div
        className={`${
          !showSidebar ? "flex" : "hidden"
        } sm:flex flex-col flex-1 min-w-0`}
      >
        <ChatView
          conversation={selectedConversation}
          clientInboxId={client?.inboxId}
          onBack={() => setShowSidebar(true)}
        />
      </div>

      {/* New chat modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
}
