"use client";

import { useEffect, useRef, useState } from "react";
import { restoreStudentSession } from "./client";
import type { JsonRecord } from "./student";

const DEFAULT_WS_URL = "ws://localhost:8080/ws";
const WS_URL = (process.env.NEXT_PUBLIC_WS_BASE_URL || DEFAULT_WS_URL)
  .replace(/\/$/, "")
  .endsWith("/ws")
  ? (process.env.NEXT_PUBLIC_WS_BASE_URL || DEFAULT_WS_URL).replace(/\/$/, "")
  : `${(process.env.NEXT_PUBLIC_WS_BASE_URL || DEFAULT_WS_URL).replace(/\/$/, "")}/ws`;

export type StudentRealtimeStatus = "connecting" | "connected" | "reconnecting" | "offline";

export type StudentRealtimeMessage = JsonRecord & {
  id: string;
  groupId: string;
  senderId: string;
  sentAt: string;
};

function parseFrame(frame: string): StudentRealtimeMessage | null {
  const bodyStart = frame.indexOf("\n\n");
  if (bodyStart < 0) return null;
  try {
    const payload = JSON.parse(frame.slice(bodyStart + 2).replace(/\0$/, "")) as JsonRecord;
    if (!payload.id || !payload.groupId || !payload.senderId || !payload.sentAt) return null;
    return payload as StudentRealtimeMessage;
  } catch {
    return null;
  }
}

export function useStudentCommunicationRealtime(
  groupIds: string[],
  onMessage: (message: StudentRealtimeMessage) => void,
) {
  const [status, setStatus] = useState<StudentRealtimeStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const groupsRef = useRef(groupIds);
  const onMessageRef = useRef(onMessage);
  const seenIdsRef = useRef(new Set<string>());
  const groupKey = Array.from(new Set(groupIds.filter(Boolean)))
    .sort()
    .join(",");

  useEffect(() => {
    groupsRef.current = Array.from(new Set(groupIds.filter(Boolean)));
  }, [groupIds]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const sendSubscriptions = () => {
      groupsRef.current.forEach((groupId) => {
        socket?.send(
          `SUBSCRIBE\nid:group-${groupId}\ndestination:/topic/groups/${encodeURIComponent(groupId)}\nack:auto\n\n\0`,
        );
      });
    };

    const connect = async () => {
      const session = await restoreStudentSession();
      if (stopped) return;
      if (!session?.accessToken) {
        setStatus("offline");
        return;
      }

      socket = new WebSocket(WS_URL);
      socket.onopen = () => {
        socket?.send(
          `CONNECT\naccept-version:1.2\nheart-beat:10000,10000\nAuthorization:Bearer ${session.accessToken}\n\n\0`,
        );
      };
      socket.onmessage = (event) => {
        const frame = String(event.data);
        if (frame.startsWith("CONNECTED")) {
          setError(null);
          setStatus("connected");
          sendSubscriptions();
          return;
        }
        if (frame.startsWith("MESSAGE")) {
          const message = parseFrame(frame);
          if (message && !seenIdsRef.current.has(message.id)) {
            seenIdsRef.current.add(message.id);
            onMessageRef.current(message);
          }
        }
        if (frame.startsWith("ERROR")) setError("Real-time communication failed.");
      };
      socket.onerror = () => {
        setError("Real-time communication is temporarily unavailable.");
        setStatus("reconnecting");
      };
      socket.onclose = () => {
        if (stopped) return;
        setStatus("reconnecting");
        reconnectTimer = setTimeout(() => void connect(), 1500);
      };
    };

    void connect();
    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [groupKey]);

  return { status, error };
}
