"use client";

import type { DecodedMessage } from "@xmtp/browser-sdk";
import { formatMessageTime } from "@/lib/utils";
import { GroupMessageKind } from "@xmtp/browser-sdk";

interface MessageBubbleProps {
  message: DecodedMessage;
  isSender: boolean;
}

export function MessageBubble({ message, isSender }: MessageBubbleProps) {
  // Skip non-application messages (membership changes, etc.)
  if (message.kind !== GroupMessageKind.Application) {
    return null;
  }

  const content =
    typeof message.content === "string" ? message.content : null;

  if (!content) return null;

  return (
    <div
      className={`flex ${isSender ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`
          max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl
          ${
            isSender
              ? "bg-[var(--color-accent)] text-black rounded-br-md"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-bl-md"
          }
        `}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {content}
        </p>
        <p
          className={`text-[10px] mt-1.5 ${
            isSender ? "text-black/50" : "text-[var(--color-text-muted)]"
          }`}
        >
          {formatMessageTime(message.sentAt)}
        </p>
      </div>
    </div>
  );
}
