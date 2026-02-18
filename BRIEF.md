# Abstract XMTP Chat App — Build Brief

## Goal
Build a Next.js chat application where users sign in with Abstract Global Wallet (AGW) and chat with each other using XMTP protocol (E2E encrypted, wallet-to-wallet messaging).

## Tech Stack
- **Next.js 15** (App Router) with TypeScript
- **Abstract Global Wallet** for auth: `@abstract-foundation/agw-react`, `@abstract-foundation/agw-client`
- **XMTP** for messaging: `@xmtp/browser-sdk` (browser client, NOT agent-sdk)
- **wagmi** + **viem** (comes with AGW)
- **@tanstack/react-query**
- **Tailwind CSS v4** for styling
- **pnpm** as package manager

## Reference Repos
- AGW Next.js example: `https://github.com/Abstract-Foundation/examples/tree/main/agw-nextjs`
  - Clone this as the starting point: `npx @abstract-foundation/create-abstract-app@latest`
  - Uses `AbstractWalletProvider`, `useAbstractClient`, `useGlobalWalletSignerAccount`, etc.
- Abstract Portal: `https://portal.abs.xyz` — reference for visual styling
- Abstract SDK Demo: `https://sdk.demos.abs.xyz/` — reference for component patterns
- XMTP browser docs: `https://docs.xmtp.org/get-started/developer-quickstart`

## Design Requirements
- **Dark theme** matching Abstract's aesthetic (dark backgrounds, clean typography, subtle gradients)
- **Abstract's brand colors**: primary green (#00FF85), dark backgrounds (#0A0A0A, #1A1A1A), clean white text
- Clean, minimal UI — not cluttered. Think modern chat apps (iMessage dark mode meets crypto)
- Mobile-responsive
- Smooth transitions/animations

## Core Features

### 1. Authentication
- Login with Abstract Global Wallet (AGW) button
- Show connected wallet address / AGW account
- Logout button

### 2. Conversation List (Left Panel)
- List of existing XMTP conversations
- Show the other party's address (truncated)
- Last message preview + timestamp
- "New Chat" button to start a conversation with any Ethereum address
- Search/filter conversations

### 3. Chat View (Right Panel)
- Message bubbles (sent vs received, different colors)
- Timestamps
- Auto-scroll to latest message
- Message input with send button (and Enter key support)
- Loading states while XMTP initializes
- Empty state when no conversation is selected

### 4. New Conversation
- Modal or inline input to enter an Ethereum address
- Validate the address format
- Create XMTP conversation and start chatting

### 5. XMTP Integration
- Initialize XMTP client using the wallet signer from AGW
- Stream messages in real-time
- Handle the case where the other user hasn't joined XMTP yet (show a message)
- Persist conversations across page reloads (XMTP handles this via its SDK)

## Architecture
```
app/
  layout.tsx          — AbstractWalletProvider + QueryClientProvider
  page.tsx            — Main chat layout (sidebar + chat area)
  globals.css         — Tailwind + custom Abstract-themed styles
components/
  ConnectButton.tsx   — AGW login/logout
  ConversationList.tsx — Left sidebar with conversations
  ChatView.tsx        — Message display + input
  NewChatModal.tsx    — Start new conversation
  MessageBubble.tsx   — Individual message component
hooks/
  useXmtp.ts          — XMTP client initialization
  useConversations.ts — List & stream conversations
  useMessages.ts      — Messages for a conversation
lib/
  xmtp.ts             — XMTP client helpers
  utils.ts            — Address formatting, timestamps, etc.
```

## Important Notes
- Use `abstract` (mainnet) chain, not testnet
- The XMTP browser SDK uses the wallet's signer — AGW provides this via wagmi hooks
- XMTP messages are E2E encrypted — this is a key selling point, mention it in the UI
- Don't use the XMTP agent SDK (that's for server-side bots) — use `@xmtp/browser-sdk` for browser clients
- Check https://docs.xmtp.org for the latest browser SDK API
- Create a proper README.md with setup instructions
- Add a `.env.example` with any needed env vars
- Make sure `npm run build` passes with no errors

## What NOT to Do
- No server-side XMTP (browser only)
- No complex state management (React Query + hooks is fine)
- No unnecessary dependencies
- No placeholder/mock data in production — real XMTP integration

## After Building
- Create a GitHub repo at `coffeexcoin/abstract-xmtp-chat`
- Commit all code with proper .gitignore
- Push to main
