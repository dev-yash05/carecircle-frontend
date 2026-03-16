"use client";

import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDashboardStore } from "@/lib/stores/dashboardStore";

const SockJS = require("sockjs-client");

export interface DashboardMessage {
  type: string;
  patientId?: string;
  timestamp?: string;
  payload?: Record<string, unknown>;
}

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const queryClient = useQueryClient();
  const orgId = useAuthStore((state) => state.user?.organizationId);
  const handleMessage = useDashboardStore((state) => state.handleMessage);

  useEffect(() => {
    if (!orgId) return;
    if (clientRef.current?.connected || clientRef.current?.active) return;

    const client = new Client({
      reconnectDelay: 5000,
      debug: () => undefined,
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`) as unknown as WebSocket,
      onConnect: () => {
        client.subscribe(`/topic/org/${orgId}/dashboard`, (frame) => {
          try {
            const parsed = JSON.parse(frame.body) as DashboardMessage;
            handleMessage(parsed);
          } catch {
            handleMessage({ type: "UNKNOWN", payload: { message: "Unable to parse dashboard event" } });
          }

          queryClient.invalidateQueries({ queryKey: ["doses"] });
          queryClient.invalidateQueries({ queryKey: ["vitals"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [orgId, queryClient, handleMessage]);
}
