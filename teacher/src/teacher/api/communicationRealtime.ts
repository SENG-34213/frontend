"use client";

import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useEffect, useRef, useState } from "react";
import { restoreTeacherSession } from "./client";
import type { CommunicationMessage } from "./communicationApi";

const DEFAULT_WS_URL = "ws://localhost:8080/ws";
const configuredWsUrl = (process.env.NEXT_PUBLIC_WS_BASE_URL || DEFAULT_WS_URL).replace(/\/$/, "");
const WS_URL = configuredWsUrl.endsWith("/ws") ? configuredWsUrl : `${configuredWsUrl}/ws`;

export type CommunicationRealtimeStatus = "connecting" | "connected" | "reconnecting" | "offline";

function parseMessage(frame: IMessage): CommunicationMessage | null {
  try {
    const payload = JSON.parse(frame.body) as Partial<CommunicationMessage>;
    if (
      typeof payload.id !== "string" ||
      typeof payload.groupId !== "string" ||
      typeof payload.senderId !== "string" ||
      typeof payload.content !== "string" ||
      typeof payload.sentAt !== "string"
    ) {
      return null;
    }

    return {
      id: payload.id,
      groupId: payload.groupId,
      senderId: payload.senderId,
      content: payload.content,
      type: payload.type,
      sentAt: payload.sentAt,
      editedAt: payload.editedAt,
      edited: Boolean(payload.edited),
      deletedForEveryone: Boolean(payload.deletedForEveryone),
    };
  } catch {
    return null;
  }
}

export function useCommunicationRealtime(
  groupIds: string[],
  onMessage: (message: CommunicationMessage) => void,
) {
  const [status, setStatus] = useState<CommunicationRealtimeStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef(new Map<string, StompSubscription>());
  const groupIdsRef = useRef(groupIds);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    groupIdsRef.current = Array.from(new Set(groupIds.filter(Boolean)));
  }, [groupIds]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => undefined,
    });

    client.beforeConnect = async () => {
      const session = await restoreTeacherSession();
      if (!session?.accessToken) {
        setStatus("offline");
        throw new Error("Teacher session is unavailable for real-time communication.");
      }
      client.connectHeaders = { Authorization: `Bearer ${session.accessToken}` };
    };

    const subscribeToGroups = () => {
      if (!client.connected) return;
      const desiredGroups = new Set(groupIdsRef.current);

      subscriptionsRef.current.forEach((subscription, groupId) => {
        if (!desiredGroups.has(groupId)) {
          subscription.unsubscribe();
          subscriptionsRef.current.delete(groupId);
        }
      });

      desiredGroups.forEach((groupId) => {
        if (subscriptionsRef.current.has(groupId)) return;
        const subscription = client.subscribe(`/topic/groups/${encodeURIComponent(groupId)}`, (frame) => {
          const message = parseMessage(frame);
          if (message && message.groupId === groupId) onMessageRef.current(message);
        });
        subscriptionsRef.current.set(groupId, subscription);
      });
    };

    client.onConnect = () => {
      setError(null);
      setStatus("connected");
      subscribeToGroups();
    };
    client.onStompError = (frame) => {
      setError(frame.headers.message || "Real-time communication failed.");
    };
    client.onWebSocketClose = () => {
      subscriptionsRef.current.clear();
      setStatus("reconnecting");
    };
    client.onWebSocketError = () => {
      setStatus("reconnecting");
    };

    clientRef.current = client;
    setStatus("connecting");
    client.activate();
    const subscriptions = subscriptionsRef.current;

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      subscriptions.clear();
      clientRef.current = null;
      void client.deactivate();
    };
  }, []);

  useEffect(() => {
    if (!clientRef.current?.connected) return;
    const desiredGroups = new Set(groupIds.filter(Boolean));
    subscriptionsRef.current.forEach((subscription, groupId) => {
      if (!desiredGroups.has(groupId)) {
        subscription.unsubscribe();
        subscriptionsRef.current.delete(groupId);
      }
    });
    desiredGroups.forEach((groupId) => {
      if (subscriptionsRef.current.has(groupId)) return;
      const subscription = clientRef.current?.subscribe(`/topic/groups/${encodeURIComponent(groupId)}`, (frame) => {
        const message = parseMessage(frame);
        if (message && message.groupId === groupId) onMessageRef.current(message);
      });
      if (subscription) subscriptionsRef.current.set(groupId, subscription);
    });
  }, [groupIds]);

  function sendMessage(groupId: string, content: string) {
    const client = clientRef.current;
    if (!client?.connected) return false;
    client.publish({
      destination: `/app/groups/${encodeURIComponent(groupId)}/messages`,
      body: JSON.stringify({ content }),
    });
    return true;
  }

  return { status, error, sendMessage, isConnected: status === "connected" };
}
