"use client";

import React from "react";
import { XmtpContext, useXmtpClient } from "@/hooks/useXmtp";

export function XmtpProvider({ children }: { children: React.ReactNode }) {
  const xmtpState = useXmtpClient();

  return (
    <XmtpContext.Provider value={xmtpState}>{children}</XmtpContext.Provider>
  );
}
