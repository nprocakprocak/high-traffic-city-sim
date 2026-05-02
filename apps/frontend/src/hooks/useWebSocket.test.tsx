// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PEDESTRIAN_LIMIT_EXCEEDED_SOCKET_EVENT,
  type Pedestrian,
} from "@high-traffic-city-sim/types";
import type { Socket } from "socket.io-client";
import { PEDESTRIAN_WEBSOCKET_BUFFER_FLUSH_MS } from "../constants";
import { useWebSocket } from "./useWebSocket";

interface EmittedEvent {
  event: string;
  payload: unknown;
}

type SocketHandler = (payload: unknown) => void;

class MockSocket {
  public readonly disconnect = vi.fn();
  public readonly emitted: EmittedEvent[] = [];
  private readonly handlers = new Map<string, SocketHandler[]>();

  on(event: string, handler: SocketHandler): void {
    const existingHandlers = this.handlers.get(event) ?? [];
    existingHandlers.push(handler);
    this.handlers.set(event, existingHandlers);
  }

  emit(event: string, payload?: unknown): void {
    this.emitted.push({ event, payload });
  }

  trigger(event: string, payload: unknown): void {
    const handlers = this.handlers.get(event) ?? [];
    for (const handler of handlers) {
      handler(payload);
    }
  }
}

const mockIo = vi.hoisted(() => vi.fn());
vi.mock("socket.io-client", () => ({
  io: mockIo,
}));

function buildPedestrian(id: string, overrides: Partial<Pedestrian> = {}): Pedestrian {
  return {
    id,
    name: `Pedestrian ${id}`,
    mood: "happy",
    velocity: 4,
    thirst: 3,
    ...overrides,
  };
}

describe("useWebSocket", () => {
  let socket: MockSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    socket = new MockSocket();
    mockIo.mockReset();
    mockIo.mockReturnValue(socket as unknown as Socket);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("emits control events through returned callbacks", () => {
    const { result } = renderHook(() => useWebSocket(vi.fn(), vi.fn(), vi.fn()));

    act(() => {
      result.current.setSpawnInterval(7);
      result.current.startSession();
      result.current.stopSession();
    });

    expect(socket.emitted).toEqual([
      { event: "set_spawn_interval_mult", payload: 7 },
      { event: "session_start", payload: undefined },
      { event: "session_stop", payload: undefined },
    ]);
  });

  it("forwards events immediately when buffering is disabled", () => {
    const onNewPedestrians = vi.fn();
    const onRemovePedestrians = vi.fn();
    const onUpdatePedestrians = vi.fn();

    renderHook(() => useWebSocket(onNewPedestrians, onRemovePedestrians, onUpdatePedestrians));

    act(() => {
      socket.trigger("pedestrians", [buildPedestrian("a")]);
      socket.trigger("remove_pedestrian", "a");
      socket.trigger("update_pedestrian", { id: "b", mood: "sad" });
    });

    expect(onNewPedestrians).toHaveBeenCalledWith([buildPedestrian("a")]);
    expect(onRemovePedestrians).toHaveBeenCalledWith(["a"]);
    expect(onUpdatePedestrians).toHaveBeenCalledWith([{ id: "b", updates: { mood: "sad" } }]);
  });

  it("buffers and merges events before flushing", () => {
    const onNewPedestrians = vi.fn();
    const onRemovePedestrians = vi.fn();
    const onUpdatePedestrians = vi.fn();

    renderHook(() =>
      useWebSocket(onNewPedestrians, onRemovePedestrians, onUpdatePedestrians, {
        isBufferingEnabled: true,
      }),
    );

    act(() => {
      socket.trigger("remove_pedestrian", "a");
      socket.trigger("remove_pedestrian", "a");
      socket.trigger("update_pedestrian", { id: "b", mood: "sad" });
      socket.trigger("update_pedestrian", { id: "b", velocity: 9 });
      socket.trigger("pedestrians", [buildPedestrian("x"), buildPedestrian("y")]);
    });

    expect(onRemovePedestrians).not.toHaveBeenCalled();
    expect(onUpdatePedestrians).not.toHaveBeenCalled();
    expect(onNewPedestrians).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(PEDESTRIAN_WEBSOCKET_BUFFER_FLUSH_MS);
    });

    expect(onRemovePedestrians).toHaveBeenCalledWith(["a"]);
    expect(onUpdatePedestrians).toHaveBeenCalledWith([
      { id: "b", updates: { mood: "sad", velocity: 9 } },
    ]);
    expect(onNewPedestrians).toHaveBeenCalledWith([buildPedestrian("x"), buildPedestrian("y")]);
  });

  it("sets error when pedestrian limit is exceeded", () => {
    const { result } = renderHook(() => useWebSocket(vi.fn(), vi.fn(), vi.fn()));

    act(() => {
      socket.trigger("connect", undefined);
    });

    act(() => {
      socket.trigger(PEDESTRIAN_LIMIT_EXCEEDED_SOCKET_EVENT, {
        message: "Pedestrian limit exceeded (501 exceeds maximum 500).",
      });
    });

    expect(result.current.error).toBe("Pedestrian limit exceeded (501 exceeds maximum 500).");
  });

  it("clears error when starting a session", () => {
    const { result } = renderHook(() => useWebSocket(vi.fn(), vi.fn(), vi.fn()));

    act(() => {
      socket.trigger("connect", undefined);
    });

    act(() => {
      socket.trigger("connect_error", new Error("boom"));
    });
    expect(result.current.error).toBe("Connection error: boom");

    act(() => {
      result.current.startSession();
    });
    expect(result.current.error).toBeNull();
  });

  it("reports non-transient connection errors only", () => {
    const { result } = renderHook(() => useWebSocket(vi.fn(), vi.fn(), vi.fn()));

    act(() => {
      socket.trigger("connect", undefined);
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();

    act(() => {
      socket.trigger("connect_error", new Error("closed before the connection is established"));
    });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();

    act(() => {
      socket.trigger("connect_error", new Error("boom"));
    });
    expect(result.current.error).toBe("Connection error: boom");
  });

  it("flushes buffered events immediately after disabling buffering", () => {
    const onNewPedestrians = vi.fn();
    const onRemovePedestrians = vi.fn();
    const onUpdatePedestrians = vi.fn();

    const { rerender } = renderHook(
      ({ isBufferingEnabled }: { isBufferingEnabled: boolean }) =>
        useWebSocket(onNewPedestrians, onRemovePedestrians, onUpdatePedestrians, {
          isBufferingEnabled,
        }),
      {
        initialProps: { isBufferingEnabled: true },
      },
    );

    act(() => {
      socket.trigger("pedestrians", [buildPedestrian("a")]);
      socket.trigger("remove_pedestrian", "a");
      socket.trigger("update_pedestrian", { id: "b", mood: "sad" });
    });

    expect(onNewPedestrians).not.toHaveBeenCalled();
    expect(onRemovePedestrians).not.toHaveBeenCalled();
    expect(onUpdatePedestrians).not.toHaveBeenCalled();

    rerender({ isBufferingEnabled: false });

    expect(onNewPedestrians).toHaveBeenCalledWith([buildPedestrian("a")]);
    expect(onRemovePedestrians).toHaveBeenCalledWith(["a"]);
    expect(onUpdatePedestrians).toHaveBeenCalledWith([{ id: "b", updates: { mood: "sad" } }]);
  });

  it("disconnects socket on unmount", () => {
    const { unmount } = renderHook(() => useWebSocket(vi.fn(), vi.fn(), vi.fn()));
    unmount();
    expect(socket.disconnect).toHaveBeenCalledTimes(1);
  });
});
