# Status Code System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    C++ AviaConnector                            │
│                                                                 │
│  Sends status messages via WebSocket:                          │
│  { "type": "Status", "data": { "code": "600", "message": "" }}│
└─────────────────────────┬───────────────────────────────────────┘
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              AviaConnectorServer.ts                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ handleMessage(message: MessageEnvelope)                  │ │
│  │  - Receives message                                      │ │
│  │  - Extracts { code, message }                            │ │
│  │  - Creates StatusMessage object                          │ │
│  │  - Calls onStatusMessage callback                        │ │
│  │  - Checks if simulator-related with isSimulatorStatusCode│ │
│  │  - Updates simulatorStatus with statusCode               │ │
│  │  - Calls onSimulatorStatus callback                      │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    statusCodes.ts                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ StatusCode Enum                                          │ │
│  │  ├─ 2xx: OK, CREATED, ACCEPTED                          │ │
│  │  ├─ 4xx: BAD_REQUEST, NOT_FOUND, etc.                   │ │
│  │  ├─ 5xx: INTERNAL_SERVER_ERROR, etc.                    │ │
│  │  ├─ 6xx: SIMULATOR_CONNECTED, DISCONNECTED, etc.        │ │
│  │  └─ 9xx: CUSTOM_900-909 (reserved)                      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ StatusCodeDescription                                    │ │
│  │  - Human-readable descriptions for each code             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Helper Functions                                         │ │
│  │  ├─ isValidStatusCode(code)                             │ │
│  │  ├─ getStatusCodeCategory(code)                         │ │
│  │  ├─ getStatusCodeDescription(code)                      │ │
│  │  ├─ isSuccessStatusCode(code)                           │ │
│  │  ├─ isErrorStatusCode(code)                             │ │
│  │  └─ isSimulatorStatusCode(code)                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ StatusMessage Interface                                  │ │
│  │  { code: StatusCode | string, message: string }          │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    User Application                             │
│                                                                 │
│  import { StatusCode, isSimulatorStatusCode } from "sdk";      │
│                                                                 │
│  server.on("Status", (statusMsg: StatusMessage) => {           │
│    if (statusMsg.code === StatusCode.SIMULATOR_CONNECTED) {    │
│      // Handle connection                                      │
│    }                                                            │
│  });                                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **C++ Sends Status**
   ```json
   { "type": "Status", "data": { "code": "600", "message": "MSFS" } }
   ```

2. **Server Receives & Parses**
   - Extracts `code` and `message`
   - Creates `StatusMessage` object
   - Validates with `isSimulatorStatusCode(code)`

3. **Server Callbacks**
   - `onStatusMessage(statusMessage)` - All status messages
   - `onSimulatorStatus(simulatorStatus)` - Simulator state changes

4. **User Handles**
   - Type-safe comparison: `code === StatusCode.SIMULATOR_CONNECTED`
   - Helper functions: `getStatusCodeDescription(code)`
   - Category checks: `isErrorStatusCode(code)`

## Status Code Categories

```
┌─────────────────────────────────────────────┐
│          Status Code Categories             │
├─────────────┬───────────────────────────────┤
│    2xx      │  Success                      │
│  (Success)  │  - OK (200)                   │
│             │  - CREATED (201)              │
│             │  - ACCEPTED (202)             │
├─────────────┼───────────────────────────────┤
│    4xx      │  Client Errors                │
│  (Client    │  - BAD_REQUEST (400)          │
│   Error)    │  - NOT_FOUND (404)            │
│             │  - UNAUTHORIZED (401)         │
├─────────────┼───────────────────────────────┤
│    5xx      │  Server Errors                │
│  (Server    │  - INTERNAL_SERVER_ERROR (500)│
│   Error)    │  - BAD_GATEWAY (502)          │
│             │  - SERVICE_UNAVAILABLE (503)  │
├─────────────┼───────────────────────────────┤
│    6xx      │  Simulator Status             │
│ (Simulator) │  - CONNECTED (600)            │
│             │  - DISCONNECTED (601)         │
│             │  - PAUSED (602)               │
│             │  - RESUMED (603)              │
│             │  - ERROR (604)                │
│             │  - INITIALIZING (605)         │
│             │  - READY (606)                │
├─────────────┼───────────────────────────────┤
│    9xx      │  Custom Codes                 │
│  (Custom)   │  - CUSTOM_900 (900)           │
│             │  - CUSTOM_901 (901)           │
│             │  - ... (902-909)              │
└─────────────┴───────────────────────────────┘
```

## Extension Points

### 1. Adding New Standard Codes

```typescript
// In src/statusCodes.ts
export enum StatusCode {
  // ... existing codes ...
  SIMULATOR_LOADING = "607",  // Add new code
}

export const StatusCodeDescription = {
  // ... existing descriptions ...
  [StatusCode.SIMULATOR_LOADING]: "Simulator loading scenery",
};
```

### 2. Using Custom Code Range

```typescript
// In your application
export enum CustomStatusCode {
  MY_FEATURE_START = "900",
  MY_FEATURE_STOP = "901",
}

// Use alongside standard codes
if (status.code === CustomStatusCode.MY_FEATURE_START) {
  // Handle custom feature
}
```

## Type Safety Flow

```
┌─────────────────┐
│  String "600"   │ (from C++)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  StatusMessage         │
│  { code: string,       │
│    message: string }   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  isValidStatusCode()   │  ──Yes──> StatusCode enum type
│  Type Guard            │
└────────┬────────────────┘
         │
         No
         ▼
    Still valid (forward compatible)
    Treated as generic string
```

## Helper Function Categories

```
┌──────────────────────────────────────────────┐
│           Helper Functions                   │
├──────────────────────────────────────────────┤
│                                              │
│  Validation                                  │
│  └─ isValidStatusCode(code)                  │
│     Returns: boolean                         │
│     Purpose: Type guard                      │
│                                              │
│  Information                                 │
│  ├─ getStatusCodeCategory(code)              │
│  │  Returns: "2xx" | "4xx" | "5xx" | "6xx"  │
│  └─ getStatusCodeDescription(code)           │
│     Returns: string                          │
│                                              │
│  Type Checks                                 │
│  ├─ isSuccessStatusCode(code)                │
│  ├─ isErrorStatusCode(code)                  │
│  └─ isSimulatorStatusCode(code)              │
│     Returns: boolean                         │
│                                              │
└──────────────────────────────────────────────┘
```

## Integration Example

```typescript
// Full integration flow
import { 
  AviaConnectorServer,
  StatusCode,
  type StatusMessage,
  isSimulatorStatusCode,
  getStatusCodeDescription 
} from "avia-connector-sdk";

const server = new AviaConnectorServer({
  port: 9000,
  
  // Catch all status messages
  onStatusMessage: (msg: StatusMessage) => {
    console.log(`Status: ${msg.code} - ${getStatusCodeDescription(msg.code)}`);
    
    if (isSimulatorStatusCode(msg.code)) {
      handleSimulatorStatus(msg);
    }
  },
  
  // Catch simulator state changes
  onSimulatorStatus: (status) => {
    console.log(`Simulator: ${status.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`Latest code: ${status.statusCode}`);
  }
});

function handleSimulatorStatus(msg: StatusMessage) {
  switch (msg.code) {
    case StatusCode.SIMULATOR_CONNECTED:
      console.log("✈️ Ready to fly!");
      break;
    case StatusCode.SIMULATOR_DISCONNECTED:
      console.log("❌ Simulator offline");
      break;
    case StatusCode.SIMULATOR_PAUSED:
      console.log("⏸️ Paused");
      break;
  }
}
```
