import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Pedestrian } from "@high-traffic-city-sim/types";

export function useWebSocket(
  onNewPedestrian: (pedestrian: Pedestrian) => void,
  onRemovePedestrian: (id: string) => void,
  onUpdatePedestrian: (id: string, updates: Partial<Omit<Pedestrian, "id">>) => void,
) {
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const onNewPedestrianRef = useRef(onNewPedestrian);
  const onRemovePedestrianRef = useRef(onRemovePedestrian);
  const onUpdatePedestrianRef = useRef(onUpdatePedestrian);

  useEffect(() => {
    onNewPedestrianRef.current = onNewPedestrian;
  }, [onNewPedestrian]);

  useEffect(() => {
    onRemovePedestrianRef.current = onRemovePedestrian;
  }, [onRemovePedestrian]);

  useEffect(() => {
    onUpdatePedestrianRef.current = onUpdatePedestrian;
  }, [onUpdatePedestrian]);

  const setSpawnInterval = useCallback((value: number) => {
    socketRef.current?.emit("set_spawn_interval_mult", value);
  }, []);

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
      for (const pedestrian of pedestrians) {
        onNewPedestrianRef.current(pedestrian);
      }
    });

    newSocket.on("remove_pedestrian", (id: string) => {
      onRemovePedestrianRef.current(id);
    });

    newSocket.on(
      "update_pedestrian",
      ({ id, ...updates }: { id: string } & Partial<Omit<Pedestrian, "id">>) => {
        onUpdatePedestrianRef.current(id, updates);
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
