import { WebSocketServer, WebSocket } from "ws";
import type { AircraftData, MessageEnvelope, SimulatorStatus, PongResponse } from "../types";
import { StatusCode, type StatusMessage, isSimulatorStatusCode, getStatusCodeDescription } from "../statusCodes";

export interface AviaConnectorServerOptions {
  port: number;
  host?: string;
  path?: string;
  
  /**
   * Callback when server starts listening
   */
  onListening?: (url: string) => void;
  
  /**
   * Callback when client connects
   */
  onConnection?: () => void;
  
  /**
   * Callback when client disconnects
   */
  onDisconnect?: () => void;
  
  /**
   * Callback when aircraft data is received
   */
  onAircraftData?: (data: AircraftData) => void;
  
  /**
   * Callback when simulator connection status changes
   */
  onSimulatorStatus?: (status: SimulatorStatus) => void;
  
  /**
   * Callback for any status message received from AviaConnector
   */
  onStatusMessage?: (statusMessage: StatusMessage) => void;
  
  /**
   * Callback when pong response is received
   */
  onPong?: (response: PongResponse) => void;
  
  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;
}

/**
 * Simplified AviaConnector WebSocket Server
 * - Single client only
 * - Only handles aircraft data
 * - Simple callback-based API
 */
export class AviaConnectorServer {
  private wss: WebSocketServer;
  private client?: WebSocket;
  private simulatorStatus: SimulatorStatus = { last_error: 0, simulator_connected: false, simulator_loaded: false, simulator_name: undefined };
  
  // Callbacks
  private readonly onListening?: (url: string) => void;
  private readonly onConnection?: () => void;
  private readonly onDisconnect?: () => void;
  private readonly onAircraftData?: (data: AircraftData) => void;
  private readonly onSimulatorStatus?: (status: SimulatorStatus) => void;
  private readonly onStatusMessage?: (statusMessage: StatusMessage) => void;
  private readonly onPong?: (response: PongResponse) => void;
  private readonly onError?: (error: Error) => void;

  constructor(opts: AviaConnectorServerOptions) {
    this.onListening = opts.onListening;
    this.onConnection = opts.onConnection;
    this.onDisconnect = opts.onDisconnect;
    this.onAircraftData = opts.onAircraftData;
    this.onSimulatorStatus = opts.onSimulatorStatus;
    this.onStatusMessage = opts.onStatusMessage;
    this.onPong = opts.onPong;
    this.onError = opts.onError;

    const host = opts.host ?? "0.0.0.0";
    const port = opts.port;
    const path = opts.path;

    this.wss = new WebSocketServer({ host, port, path });

    this.wss.on("listening", () => {
      const url = `ws://${host}:${port}${path ?? ""}`;
      this.onListening?.(url);
    });

    this.wss.on("connection", (ws) => {
      // Only support single client - close existing if new one connects
      if (this.client) {
        this.client.close(1000, "New client connected");
      }
      
      this.client = ws;
      this.onConnection?.();

      ws.on("message", (raw) => {
        try {
          const message = this.parseMessage(raw);
          this.handleMessage(message);
        } catch (err) {
          this.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      });

      ws.on("close", () => {
        if (this.client === ws) {
          this.client = undefined;
          this.onDisconnect?.();
        }
      });

      ws.on("error", (err) => {
        this.onError?.(err);
      });
    });

    this.wss.on("error", (err) => {
      this.onError?.(err);
    });
  }

  /**
   * Parse raw WebSocket message to JSON
   */
  private parseMessage(raw: any): MessageEnvelope {
    // Convert Buffer/ArrayBuffer to string
    let text: string;
    
    if (typeof raw === "string") {
      text = raw;
    } else if (Buffer.isBuffer(raw)) {
      text = raw.toString("utf8");
    } else if (raw instanceof ArrayBuffer) {
      text = Buffer.from(raw).toString("utf8");
    } else if (Array.isArray(raw)) {
      const buffers = raw.map(item => Buffer.isBuffer(item) ? item : Buffer.from(item));
      text = Buffer.concat(buffers).toString("utf8");
    } else {
      text = String(raw);
    }
    
    // Parse JSON
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj.type === "string") {
        return obj as MessageEnvelope;
      }
      return { type: "unknown", data: obj };
    } catch {
      return { type: "unknown", data: text };
    }
  }

  /**
   * Handle incoming messages from AviaConnector
   */
  private handleMessage(message: MessageEnvelope) {
    const { type, data } = message;
    
    // Handle aircraft data
    if (type === "AircraftData") {
      if (!data) return;
      
      // Extract aircraft data (handle both nested and flat formats)
      const aircraftData: AircraftData = (data as any).Aircraft ?? data;
      this.onAircraftData?.(aircraftData);
    }
    
    // Handle simulator status
    else if (type === "Status") {
      if (!data) return;
      
  
      const code = (data as any);
      
      this.simulatorStatus = {
        last_error: (data as any).last_error ?? this.simulatorStatus.last_error,
        simulator_connected: (data as any).simulator_connected ?? this.simulatorStatus.simulator_connected,
        simulator_loaded: (data as any).simulator_loaded ?? this.simulatorStatus.simulator_loaded,
        simulator_name: (data as any).simulator_name ?? this.simulatorStatus.simulator_name,
      };
      
      this.onSimulatorStatus?.({ ...this.simulatorStatus });
      
    }
    
    // Handle pong response
    else if (type === "pong") {
      if (!data) return;
      const pongData = data as PongResponse;
      this.onPong?.(pongData);
    }
    
    // Handle errors
    else if (type === "Error" || type === "error") {
      const errorMsg = typeof data === "string" ? data : (data as any)?.message ?? "Unknown error";
      this.onError?.(new Error(errorMsg));
    }
  }

  /**
   * Send data to the connected client
   */
  send(data: any): boolean {
    if (!this.client || this.client.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.client.send(message);
      return true;
    } catch (err) {
      this.onError?.(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  /**
   * Request aircraft data from AviaConnector
   */
  requestAircraftData(): boolean {
    return this.send({
      type: "request",
      data: { type: "AircraftData" }
    });
  }

  requestSimulatorStatus(): boolean {
    return this.send({
      type: "Status",
      data: {}
    });
  }


  /**
   * Send a ping request to AviaConnector
   * Response will be received via onPong callback
   */
  ping(): boolean {
    return this.send({
      type: "ping"
    });
  }

  /**
   * Get current simulator connection status
   */
  getSimulatorStatus(): SimulatorStatus {
    return { ...this.simulatorStatus };
  }

  /**
   * Check if simulator is connected
   */
  isSimulatorConnected(): boolean {
    return this.simulatorStatus.simulator_connected === true;
  }

  isSimulatorLoaded(): boolean { 
    return this.simulatorStatus.simulator_loaded === true;
  }

  getSimulatorName(): string | undefined { 
    return this.simulatorStatus.simulator_name;
  }

  /**
   * Check if client is connected
   */
  isClientConnected(): boolean {
    return this.client !== undefined && this.client.readyState === WebSocket.OPEN;
  }

  /**
   * Close the server and disconnect all clients
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.client) {
        this.client.close(1000, "Server closing");
        this.client = undefined;
      }
      
      this.wss.close(() => {
        resolve();
      });
    });
  }
}