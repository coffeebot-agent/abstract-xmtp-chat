"use client";

import Image from "next/image";
import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { truncateAddress } from "@/lib/utils";

interface ConnectButtonProps {
  onInitXmtp?: () => void;
  isXmtpInitializing?: boolean;
  isXmtpConnected?: boolean;
}

export function ConnectButton({
  onInitXmtp,
  isXmtpInitializing,
  isXmtpConnected,
}: ConnectButtonProps) {
  const { login, logout } = useLoginWithAbstract();
  const { address, status } = useAccount();

  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="animate-spin">
          <Image src="/abs.svg" alt="Loading" width={20} height={20} />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">
          Connecting…
        </span>
      </div>
    );
  }

  if (!address) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2.5 px-5 py-3 bg-[var(--color-accent)] text-black rounded-xl
                   font-semibold text-sm transition-all duration-200 hover:brightness-110 hover:scale-[1.02]
                   active:scale-[0.98] cursor-pointer"
      >
        <Image src="/abs.svg" alt="Abstract" width={18} height={18} style={{ filter: "brightness(0)" }} />
        Sign in with Abstract
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* XMTP Status */}
      {isXmtpConnected ? (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent-bg)] rounded-lg">
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          <span className="text-xs text-[var(--color-accent)] font-medium">
            Encrypted
          </span>
        </div>
      ) : (
        <button
          onClick={onInitXmtp}
          disabled={isXmtpInitializing}
          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent)] text-black
                     rounded-lg text-xs font-semibold transition-all duration-200
                     hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isXmtpInitializing ? (
            <>
              <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Enable Chat
            </>
          )}
        </button>
      )}

      {/* Address */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border)]">
        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        <span className="text-xs text-[var(--color-text-secondary)] font-mono">
          {truncateAddress(address)}
        </span>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]
                   transition-colors rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer"
        title="Disconnect"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
