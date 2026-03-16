"use client";

import { useWebSocket } from "@/lib/hooks/useWebSocket";

export function WebSocketProvider() {
  useWebSocket();
  return null;
}
