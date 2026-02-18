"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstract } from "viem/chains";
import { XmtpProvider } from "./XmtpProvider";

export default function AbstractWalletWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AbstractWalletProvider chain={abstract}>
      <XmtpProvider>{children}</XmtpProvider>
    </AbstractWalletProvider>
  );
}
