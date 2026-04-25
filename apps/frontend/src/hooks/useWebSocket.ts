import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Pedestrian } from "@high-traffic-city-sim/types";
import { PEDESTRIAN_WEBSOCKET_BUFFER_FLUSH_MS } from "../constants";
import type { PedestrianFieldUpdates, PedestrianUpdate } from "../stores/pedestriansStore";

export interface UseWebSocketBufferingOptions {
  isBufferingEnabled: boolean;
}

export function useWebSocket(
  onNewPedestrians: (pedestrians: Pedestrian[]) => void,
  onRemovePedestrians: (ids: string[]) => void,
  onUpdatePedestrians: (items: PedestrianUpdate[]) => void,
  options?: UseWebSocketBufferingOptions,
) {
  const isBufferingEnabled = options?.isBufferingEnabled ?? false;
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onNewPedestriansRef = useRef(onNewPedestrians);
  const onRemovePedestriansRef = useRef(onRemovePedestrians);
  const onUpdatePedestriansRef = useRef(onUpdatePedestrians);
  const isBufferingEnabledRef = useRef(isBufferingEnabled);

  const addBufferRef = useRef<Pedestrian[]>([]);
  const removeBufferRef = useRef<string[]>([]);
  const updateMapRef = useRef<Map<string, PedestrianFieldUpdates>>(new Map());

  useLayoutEffect(() => {
    isBufferingEnabledRef.current = isBufferingEnabled;
  }, [isBufferingEnabled]);

  useEffect(() => {
    onNewPedestriansRef.current = onNewPedestrians;
  }, [onNewPedestrians]);

  useEffect(() => {
    onRemovePedestriansRef.current = onRemovePedestrians;
  }, [onRemovePedestrians]);

  useEffect(() => {
    onUpdatePedestriansRef.current = onUpdatePedestrians;
  }, [onUpdatePedestrians]);

  const setSpawnInterval = useCallback((value: number) => {
    socketRef.current?.emit("set_spawn_interval_mult", value);
  }, []);

  const flushBufferedWebsocketEvents = useCallback(() => {
    if (
      removeBufferRef.current.length === 0 &&
      updateMapRef.current.size === 0 &&
      addBufferRef.current.length === 0
    ) {
      return;
    }

    const mergedRemoveIds = Array.from(new Set(removeBufferRef.current));
    removeBufferRef.current = [];

    const mergedUpdates: PedestrianUpdate[] = Array.from(
      updateMapRef.current,
      ([id, updates]) => ({ id, updates: { ...updates } }),
    );
    updateMapRef.current = new Map();

    const mergedAddPedestrians = addBufferRef.current;
    addBufferRef.current = [];

    if (mergedRemoveIds.length > 0) {
      onRemovePedestriansRef.current(mergedRemoveIds);
    }
    if (mergedUpdates.length > 0) {
      onUpdatePedestriansRef.current(mergedUpdates);
    }
    if (mergedAddPedestrians.length > 0) {
      onNewPedestriansRef.current(mergedAddPedestrians);
    }
  }, []);

  useEffect(() => {
    if (!isBufferingEnabled) {
      flushBufferedWebsocketEvents();
      return;
    }
    const intervalId = setInterval(
      flushBufferedWebsocketEvents,
      PEDESTRIAN_WEBSOCKET_BUFFER_FLUSH_MS,
    );
    return () => {
      clearInterval(intervalId);
      flushBufferedWebsocketEvents();
    };
  }, [isBufferingEnabled, flushBufferedWebsocketEvents]);

  useEffect(() => {
    const newSocket: Socket = io("http://localhost:4000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("pedestrians", (pedestrians: Pedestrian[]) => {
      if (isBufferingEnabledRef.current) {
        if (pedestrians.length > 0) {
          addBufferRef.current = addBufferRef.current.concat(pedestrians);
        }
        return;
      }
      onNewPedestriansRef.current(pedestrians);
    });

    newSocket.on("remove_pedestrian", (id: string) => {
      if (isBufferingEnabledRef.current) {
        removeBufferRef.current.push(id);
        return;
      }
      onRemovePedestriansRef.current([id]);
    });

    newSocket.on(
      "update_pedestrian",
      ({ id, ...updates }: { id: string } & Partial<Omit<Pedestrian, "id">>) => {
        if (isBufferingEnabledRef.current) {
          const nextUpdates: PedestrianFieldUpdates = {
            ...(updateMapRef.current.get(id) ?? {}),
            ...updates,
          };
          updateMapRef.current.set(id, nextUpdates);
          return;
        }
        onUpdatePedestriansRef.current([{ id, updates }]);
      },
    );

    newSocket.on("connect_error", (err) => {
      // In development StrictMode, mount/unmount cycles can briefly close a pending
      // connection. Avoid surfacing that transient state as a user-facing error.
      const isTransientClose = err.message.includes("closed before the connection is established");
      if (!isTransientClose) {
        setError(`Connection error: ${err.message}`);
      }
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    error,
    isConnected,
    setSpawnInterval,
  };
}
