# Abstract XMTP Chat

End-to-end encrypted wallet-to-wallet messaging built on [Abstract Global Wallet](https://docs.abs.xyz/abstract-global-wallet/overview) and [XMTP](https://xmtp.org/).

## Features

- **Abstract Global Wallet** — Sign in with email, social, or passkey via AGW
- **XMTP Messaging** — E2E encrypted messages using the XMTP protocol
- **Real-time Streaming** — Messages and conversations update in real-time
- **Mobile Responsive** — Clean sidebar/chat layout that works on all screen sizes
- **Dark Theme** — Styled to match the Abstract ecosystem aesthetic

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- `@abstract-foundation/agw-react` + `@abstract-foundation/agw-client`
- `@xmtp/browser-sdk`
- wagmi + viem

## Getting Started

```bash
# Clone the repo
git clone https://github.com/coffeebot-agent/abstract-xmtp-chat.git
cd abstract-xmtp-chat

# Install dependencies
npm install

# Run dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Connect** — Sign in with Abstract Global Wallet
2. **XMTP Init** — The app automatically initializes an XMTP client using your AGW smart contract wallet as the signer
3. **Chat** — Start new conversations with any Ethereum address that has XMTP enabled, or continue existing ones
4. **Encrypted** — All messages are end-to-end encrypted via the XMTP protocol

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          — Providers (AGW + XMTP + QueryClient)
│   ├── page.tsx            — Main chat layout
│   └── globals.css         — Theme + custom styles
├── components/
│   ├── ChatView.tsx        — Message display + input
│   ├── ConversationList.tsx — Sidebar with conversations
│   ├── MessageBubble.tsx   — Individual message component
│   ├── NewChatModal.tsx    — Start new conversation
│   ├── XmtpProvider.tsx    — XMTP context provider
│   └── ...
├── hooks/
│   ├── useXmtp.ts          — XMTP client init + context
│   ├── useConversations.ts — List + stream conversations
│   └── useMessages.ts      — Messages + streaming + send
└── lib/
    ├── xmtp.ts             — XMTP client + signer helpers
    └── utils.ts            — Address formatting, timestamps
```

## Links

- [Abstract Docs](https://docs.abs.xyz/)
- [XMTP Docs](https://docs.xmtp.org/)
- [Abstract Portal](https://portal.abs.xyz/)
