# Status Code Quick Reference

## Quick Import

```typescript
import { 
  StatusCode,
  type StatusMessage,
  getStatusCodeDescription,
  isSimulatorStatusCode,
  isErrorStatusCode,
  isSuccessStatusCode
} from "avia-connector-sdk";
```

## Status Code Table

| Code | Enum Name | Category | Description |
|------|-----------|----------|-------------|
| **Success (2xx)** |
| 200 | `OK` | Success | Request successful |
| 201 | `CREATED` | Success | Resource created successfully |
| 202 | `ACCEPTED` | Success | Request accepted for processing |
| **Client Errors (4xx)** |
| 400 | `BAD_REQUEST` | Client Error | Invalid request format or parameters |
| 401 | `UNAUTHORIZED` | Client Error | Authentication required |
| 403 | `FORBIDDEN` | Client Error | Access denied |
| 404 | `NOT_FOUND` | Client Error | Resource not found |
| 405 | `METHOD_NOT_ALLOWED` | Client Error | Method not allowed |
| 408 | `REQUEST_TIMEOUT` | Client Error | Request timeout |
| 409 | `CONFLICT` | Client Error | Request conflicts with current state |
| **Server Errors (5xx)** |
| 500 | `INTERNAL_SERVER_ERROR` | Server Error | Internal server error |
| 501 | `NOT_IMPLEMENTED` | Server Error | Feature not implemented |
| 502 | `BAD_GATEWAY` | Server Error | Bad gateway |
| 503 | `SERVICE_UNAVAILABLE` | Server Error | Service temporarily unavailable |
| 504 | `GATEWAY_TIMEOUT` | Server Error | Gateway timeout |
| **Simulator (6xx)** |
| 600 | `SIMULATOR_CONNECTED` | Simulator | Simulator connected successfully |
| 601 | `SIMULATOR_DISCONNECTED` | Simulator | Simulator disconnected |
| 602 | `SIMULATOR_PAUSED` | Simulator | Simulator paused |
| 603 | `SIMULATOR_RESUMED` | Simulator | Simulator resumed |
| 604 | `SIMULATOR_ERROR` | Simulator | Simulator error occurred |
| 605 | `SIMULATOR_INITIALIZING` | Simulator | Simulator initializing |
| 606 | `SIMULATOR_READY` | Simulator | Simulator ready for operations |
| **Custom (9xx)** |
| 900-909 | `CUSTOM_9xx` | Custom | Reserved for custom extensions |

## Common Usage Patterns

### Check for Simulator Connection

```typescript
if (statusMessage.code === StatusCode.SIMULATOR_CONNECTED) {
  console.log("Simulator connected!");
}
```

### Handle Any Simulator Status

```typescript
if (isSimulatorStatusCode(statusMessage.code)) {
  console.log("Simulator status changed");
}
```

### Handle Errors

```typescript
if (isErrorStatusCode(statusMessage.code)) {
  console.error("Error:", getStatusCodeDescription(statusMessage.code));
}
```

### Switch Statement

```typescript
switch (statusMessage.code) {
  case StatusCode.SIMULATOR_CONNECTED:
    // Handle connection
    break;
  case StatusCode.SIMULATOR_DISCONNECTED:
    // Handle disconnection
    break;
  case StatusCode.SIMULATOR_ERROR:
    // Handle error
    break;
  default:
    console.log("Unknown status:", statusMessage.code);
}
```

## C++ Integration

Send status from C++:

```cpp
nlohmann::json status;
status["type"] = "Status";
status["data"]["code"] = "600";
status["data"]["message"] = "MSFS 2024 connected";
websocket.send(status.dump());
```

## Helper Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `getStatusCodeDescription(code)` | Get human-readable description | `"Simulator connected successfully"` |
| `getStatusCodeCategory(code)` | Get category (2xx, 4xx, etc.) | `"6xx"` |
| `isValidStatusCode(code)` | Check if code is valid enum | `true/false` |
| `isSuccessStatusCode(code)` | Check if 2xx code | `true/false` |
| `isErrorStatusCode(code)` | Check if 4xx or 5xx code | `true/false` |
| `isSimulatorStatusCode(code)` | Check if 6xx code | `true/false` |

## Adding Custom Codes

1. Edit `src/statusCodes.ts`
2. Add enum value: `NEW_CODE = "607"`
3. Add description: `[StatusCode.NEW_CODE]: "Description"`
4. Use in code: `StatusCode.NEW_CODE`

See `STATUS_CODES.md` for detailed instructions.
