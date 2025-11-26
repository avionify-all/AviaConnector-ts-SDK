# Status Code System

This SDK includes a comprehensive status code system for handling messages from the C++ AviaConnector.

## Overview

Status codes are organized into categories for easy maintenance and extension:

- **2xx** - Success codes
- **4xx** - Client error codes  
- **5xx** - Server error codes
- **6xx** - Simulator-specific codes
- **9xx** - Custom/extension codes (reserved for future use)

## Message Format

Status messages from AviaConnector follow this structure:

```json
{
  "type": "Status",
  "data": {
    "code": "600",
    "message": "Simulator connected: MSFS"
  }
}
```

## Available Status Codes

### Success Codes (2xx)
- `200` - OK: Request successful
- `201` - CREATED: Resource created successfully
- `202` - ACCEPTED: Request accepted for processing

### Client Error Codes (4xx)
- `400` - BAD_REQUEST: Invalid request format or parameters
- `401` - UNAUTHORIZED: Authentication required
- `403` - FORBIDDEN: Access denied
- `404` - NOT_FOUND: Resource not found
- `405` - METHOD_NOT_ALLOWED: Method not allowed
- `408` - REQUEST_TIMEOUT: Request timeout
- `409` - CONFLICT: Request conflicts with current state

### Server Error Codes (5xx)
- `500` - INTERNAL_SERVER_ERROR: Internal server error
- `501` - NOT_IMPLEMENTED: Feature not implemented
- `502` - BAD_GATEWAY: Bad gateway
- `503` - SERVICE_UNAVAILABLE: Service temporarily unavailable
- `504` - GATEWAY_TIMEOUT: Gateway timeout

### Simulator Codes (6xx)
- `600` - SIMULATOR_CONNECTED: Simulator connected successfully
- `601` - SIMULATOR_DISCONNECTED: Simulator disconnected
- `602` - SIMULATOR_PAUSED: Simulator paused
- `603` - SIMULATOR_RESUMED: Simulator resumed
- `604` - SIMULATOR_ERROR: Simulator error occurred
- `605` - SIMULATOR_INITIALIZING: Simulator initializing
- `606` - SIMULATOR_READY: Simulator ready for operations

### Custom Codes (9xx)
- `900-909` - Reserved for custom extensions

## Usage Examples

### Basic Status Handling

```typescript
import { 
  AviaConnectorServer,
  StatusCode,
  type StatusMessage 
} from "avia-connector-sdk";

const server = new AviaConnectorServer({
  port: 9000,
  
  onStatusMessage: (statusMessage: StatusMessage) => {
    const { code, message } = statusMessage;
    console.log(`Status ${code}: ${message}`);
    
    // Check specific status
    if (code === StatusCode.SIMULATOR_CONNECTED) {
      console.log("Simulator is connected!");
    }
  }
});
```

### Using Helper Functions

```typescript
import { 
  getStatusCodeDescription,
  getStatusCodeCategory,
  isSimulatorStatusCode,
  isErrorStatusCode,
  isSuccessStatusCode,
  StatusCode
} from "avia-connector-sdk";

// Get description
const desc = getStatusCodeDescription(StatusCode.SIMULATOR_CONNECTED);
console.log(desc); // "Simulator connected successfully"

// Get category
const category = getStatusCodeCategory("600");
console.log(category); // "6xx"

// Type checks
console.log(isSimulatorStatusCode("600")); // true
console.log(isErrorStatusCode("404"));     // true
console.log(isSuccessStatusCode("200"));   // true
```

### Handling Different Status Types

```typescript
onStatusMessage: (statusMessage: StatusMessage) => {
  const { code, message } = statusMessage;
  
  if (isSimulatorStatusCode(code)) {
    // Handle simulator-specific codes
    switch (code) {
      case StatusCode.SIMULATOR_CONNECTED:
        console.log("✈️ Simulator connected");
        break;
      case StatusCode.SIMULATOR_DISCONNECTED:
        console.log("❌ Simulator disconnected");
        break;
      case StatusCode.SIMULATOR_PAUSED:
        console.log("⏸️ Simulator paused");
        break;
    }
  } else if (isErrorStatusCode(code)) {
    // Handle errors
    console.error(`Error ${code}: ${message}`);
  } else if (isSuccessStatusCode(code)) {
    // Handle success
    console.log(`Success ${code}: ${message}`);
  }
}
```

### Using Simulator Status

```typescript
import { type SimulatorStatus } from "avia-connector-sdk";

onSimulatorStatus: (status: SimulatorStatus) => {
  console.log({
    connected: status.connected,
    simulator: status.simulator,    // e.g., "MSFS", "P3D"
    statusCode: status.statusCode    // Latest status code
  });
}
```

## Adding New Status Codes

The system is designed to be future-proof and extensible. To add new status codes:

### 1. Add to the StatusCode Enum

Edit `src/statusCodes.ts`:

```typescript
export enum StatusCode {
  // ... existing codes ...
  
  // Add your new code
  SIMULATOR_LOADING = "607",
  
  // Or use custom range
  CUSTOM_FEATURE = "900",
}
```

### 2. Add Description

Add to `StatusCodeDescription` in the same file:

```typescript
export const StatusCodeDescription: Record<StatusCode, string> = {
  // ... existing descriptions ...
  
  [StatusCode.SIMULATOR_LOADING]: "Simulator loading scenery",
  [StatusCode.CUSTOM_FEATURE]: "Custom feature description",
};
```

### 3. Use in C++ AviaConnector

In your C++ code, send the status message:

```cpp
// Example in C++
nlohmann::json status;
status["type"] = "Status";
status["data"]["code"] = "607";
status["data"]["message"] = "Loading scenery: KJFK";

// Send via WebSocket
ws.send(status.dump());
```

### 4. Handle in TypeScript

```typescript
import { StatusCode } from "avia-connector-sdk";

onStatusMessage: (statusMessage) => {
  if (statusMessage.code === StatusCode.SIMULATOR_LOADING) {
    console.log("Simulator is loading:", statusMessage.message);
  }
}
```

## Custom Status Code Ranges

The `9xx` range is reserved for custom/project-specific status codes:

```typescript
// Define custom codes
export enum CustomStatusCode {
  FEATURE_A_STARTED = "900",
  FEATURE_A_STOPPED = "901",
  FEATURE_B_STARTED = "902",
  FEATURE_B_STOPPED = "903",
}

// Use alongside standard codes
onStatusMessage: (statusMessage) => {
  const code = statusMessage.code;
  
  if (code === CustomStatusCode.FEATURE_A_STARTED) {
    console.log("Custom feature A started");
  }
}
```

## Type Safety

The system provides full TypeScript type safety:

```typescript
// Type-safe status code
const code: StatusCode = StatusCode.SIMULATOR_CONNECTED;

// Type guard for validation
if (isValidStatusCode(someStringCode)) {
  // someStringCode is now typed as StatusCode
  const description = StatusCodeDescription[someStringCode];
}

// StatusMessage interface
interface StatusMessage {
  code: StatusCode | string;  // Allows extension
  message: string;
}
```

## Best Practices

1. **Use Enums**: Always use `StatusCode` enum values instead of string literals
2. **Check Categories**: Use helper functions like `isSimulatorStatusCode()` to categorize
3. **Handle Unknown Codes**: The system gracefully handles unknown codes from C++
4. **Document Custom Codes**: Keep this file updated when adding custom codes
5. **Reserve Ranges**: Use the 9xx range for project-specific codes
6. **Consistent Naming**: Follow the existing naming convention (CATEGORY_ACTION)

## Forward Compatibility

The status code system is designed for forward compatibility:

- **String Union Types**: `code: StatusCode | string` allows unknown codes
- **Graceful Degradation**: Helper functions return safe defaults for unknown codes
- **Reserved Ranges**: The 9xx range is reserved for custom extensions
- **Category System**: New codes can be added to existing categories

## Integration with Existing Code

The status code system integrates seamlessly with existing SDK features:

- `onStatusMessage` callback for all status messages
- `onSimulatorStatus` callback for simulator state changes
- `SimulatorStatus` interface includes latest `statusCode`
- All status codes exported from main index

## See Also

- `examples/status-codes-example.ts` - Complete usage example
- `src/statusCodes.ts` - Status code definitions
- `src/types.ts` - Type definitions
- `src/server/AviaConnectorServer.ts` - Server implementation
