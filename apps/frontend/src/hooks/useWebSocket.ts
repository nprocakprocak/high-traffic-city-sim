import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Pedestrian } from "@high-traffic-city-sim/types";

export function useWebSocket(
  onNewPedestrian: (pedestrian: Pedestrian) => void,
  onRemovePedestrian: (id: string) => void,
) {
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onNewPedestrianRef = useRef(onNewPedestrian);
  const onRemovePedestrianRef = useRef(onRemovePedestrian);

  useEffect(() => {
    onNewPedestrianRef.current = onNewPedestrian;
  }, [onNewPedestrian]);

  useEffect(() => {
    onRemovePedestrianRef.current = onRemovePedestrian;
  }, [onRemovePedestrian]);

  useEffect(() => {
    const newSocket: Socket = io("http://localhost:4000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on("pedestrian", (pedestrian: Pedestrian) => {
      onNewPedestrianRef.current(pedestrian);
    });

    newSocket.on("remove_pedestrian", (id: string) => {
      onRemovePedestrianRef.current(id);
    });

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
    };
  }, []);

  return {
    error,
    isConnected,
  };
}
