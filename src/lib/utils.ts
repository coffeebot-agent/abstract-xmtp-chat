/**
 * Truncates an Ethereum address for display.
 * e.g. 0x1234…5678
 */
export function truncateAddress(
  address: string,
  startLen = 6,
  endLen = 4
): string {
  if (address.length <= startLen + endLen + 2) return address;
  return `${address.slice(0, startLen)}…${address.slice(-endLen)}`;
}

/**
 * Formats a timestamp for conversation list and message display.
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a full message timestamp.
 */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Validates an Ethereum address format.
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/** Alias for isValidEthereumAddress */
export const isValidAddress = isValidEthereumAddress;

/**
 * Generates a deterministic color from a hex string (e.g. inbox ID or address).
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 55%)`;
}
