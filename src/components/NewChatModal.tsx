"use client";

import React, { useState, useRef, useEffect } from "react";
import { isValidEthereumAddress } from "@/lib/utils";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (address: string) => Promise<void>;
}

export function NewChatModal({
  isOpen,
  onClose,
  onCreateConversation,
}: NewChatModalProps) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAddress("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = address.trim();

    if (!trimmed) {
      setError("Please enter an address");
      return;
    }

    if (!isValidEthereumAddress(trimmed)) {
      setError("Invalid Ethereum address format");
      return;
    }

    setIsCreating(true);
    try {
      await onCreateConversation(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#141414] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white font-[family-name:var(--font-roobert)]">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm text-white/50 mb-2 font-[family-name:var(--font-roobert)]">
              Ethereum Address
            </label>
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError(null);
              }}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl
                         text-white text-sm placeholder-white/20 outline-none font-mono
                         focus:border-[#00FF85]/30 transition-colors"
              disabled={isCreating}
            />
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-[#00FF85]/[0.04] border border-[#00FF85]/[0.08] rounded-lg">
            <svg className="w-3.5 h-3.5 text-[#00FF85]/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[11px] text-white/30">
              Messages are end-to-end encrypted via XMTP. Only you and the recipient can read them.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl
                         text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-all
                         font-[family-name:var(--font-roobert)]"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !address.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00FF85] text-black
                         rounded-xl text-sm font-semibold hover:bg-[#00CC6A] disabled:opacity-40
                         disabled:hover:bg-[#00FF85] transition-all font-[family-name:var(--font-roobert)]
                         disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Chat"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
