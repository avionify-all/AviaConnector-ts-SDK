/**
 * Status codes sent from the C++ AviaConnector
 * 
 * Organized by category for easy maintenance and extension.
 * Format: { data: { code: 'XXX', message: 'description' }, type: 'Status' }
 */

/**
 * Status code categories
 */
export enum StatusCodeCategory {
  SUCCESS = "2xx",
  CLIENT_ERROR = "4xx", 
  SERVER_ERROR = "5xx",
  SIMULATOR = "6xx",
  CUSTOM = "9xx"
}

/**
 * All available status codes from AviaConnector
 */
export enum StatusCode {
  // 2xx - Success codes
  OK = "200",
  CREATED = "201",
  ACCEPTED = "202",
  
  // 4xx - Client error codes
  BAD_REQUEST = "400",
  UNAUTHORIZED = "401",
  FORBIDDEN = "403",
  NOT_FOUND = "404",
  METHOD_NOT_ALLOWED = "405",
  REQUEST_TIMEOUT = "408",
  CONFLICT = "409",
  
  // 5xx - Server error codes
  INTERNAL_SERVER_ERROR = "500",
  NOT_IMPLEMENTED = "501",
  BAD_GATEWAY = "502",
  SERVICE_UNAVAILABLE = "503",
  GATEWAY_TIMEOUT = "504",
  
  // 6xx - Simulator-specific codes
  SIMULATOR_CONNECTED = "600",
  SIMULATOR_DISCONNECTED = "601",
  SIMULATOR_PAUSED = "602",
  SIMULATOR_RESUMED = "603",
  SIMULATOR_ERROR = "604",
  SIMULATOR_INITIALIZING = "605",
  SIMULATOR_READY = "606",
  
  // 9xx - Custom/Extension codes (reserve for future use)
  CUSTOM_900 = "900",
  CUSTOM_901 = "901",
  CUSTOM_902 = "902",
  CUSTOM_903 = "903",
  CUSTOM_904 = "904",
  CUSTOM_905 = "905",
  CUSTOM_906 = "906",
  CUSTOM_907 = "907",
  CUSTOM_908 = "908",
  CUSTOM_909 = "909",
}

/**
 * Human-readable descriptions for each status code
 */
export const StatusCodeDescription: Record<StatusCode, string> = {
  // 2xx - Success
  [StatusCode.OK]: "Request successful",
  [StatusCode.CREATED]: "Resource created successfully",
  [StatusCode.ACCEPTED]: "Request accepted for processing",
  
  // 4xx - Client errors
  [StatusCode.BAD_REQUEST]: "Invalid request format or parameters",
  [StatusCode.UNAUTHORIZED]: "Authentication required",
  [StatusCode.FORBIDDEN]: "Access denied",
  [StatusCode.NOT_FOUND]: "Resource not found",
  [StatusCode.METHOD_NOT_ALLOWED]: "Method not allowed",
  [StatusCode.REQUEST_TIMEOUT]: "Request timeout",
  [StatusCode.CONFLICT]: "Request conflicts with current state",
  
  // 5xx - Server errors
  [StatusCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [StatusCode.NOT_IMPLEMENTED]: "Feature not implemented",
  [StatusCode.BAD_GATEWAY]: "Bad gateway",
  [StatusCode.SERVICE_UNAVAILABLE]: "Service temporarily unavailable",
  [StatusCode.GATEWAY_TIMEOUT]: "Gateway timeout",
  
  // 6xx - Simulator
  [StatusCode.SIMULATOR_CONNECTED]: "Simulator connected successfully",
  [StatusCode.SIMULATOR_DISCONNECTED]: "Simulator disconnected",
  [StatusCode.SIMULATOR_PAUSED]: "Simulator paused",
  [StatusCode.SIMULATOR_RESUMED]: "Simulator resumed",
  [StatusCode.SIMULATOR_ERROR]: "Simulator error occurred",
  [StatusCode.SIMULATOR_INITIALIZING]: "Simulator initializing",
  [StatusCode.SIMULATOR_READY]: "Simulator ready for operations",
  
  // 9xx - Custom
  [StatusCode.CUSTOM_900]: "Custom status code 900",
  [StatusCode.CUSTOM_901]: "Custom status code 901",
  [StatusCode.CUSTOM_902]: "Custom status code 902",
  [StatusCode.CUSTOM_903]: "Custom status code 903",
  [StatusCode.CUSTOM_904]: "Custom status code 904",
  [StatusCode.CUSTOM_905]: "Custom status code 905",
  [StatusCode.CUSTOM_906]: "Custom status code 906",
  [StatusCode.CUSTOM_907]: "Custom status code 907",
  [StatusCode.CUSTOM_908]: "Custom status code 908",
  [StatusCode.CUSTOM_909]: "Custom status code 909",
};

/**
 * Status message data structure from AviaConnector
 */
export interface StatusMessage {
  code: StatusCode | string; // Allow string for forward compatibility
  message: string;
}

/**
 * Type guard to check if a code is a valid StatusCode enum value
 */
export function isValidStatusCode(code: string): code is StatusCode {
  return Object.values(StatusCode).includes(code as StatusCode);
}

/**
 * Get the category for a given status code
 */
export function getStatusCodeCategory(code: string): StatusCodeCategory | null {
  const codeNum = parseInt(code, 10);
  if (isNaN(codeNum)) return null;
  
  if (codeNum >= 200 && codeNum < 300) return StatusCodeCategory.SUCCESS;
  if (codeNum >= 400 && codeNum < 500) return StatusCodeCategory.CLIENT_ERROR;
  if (codeNum >= 500 && codeNum < 600) return StatusCodeCategory.SERVER_ERROR;
  if (codeNum >= 600 && codeNum < 700) return StatusCodeCategory.SIMULATOR;
  if (codeNum >= 900 && codeNum < 1000) return StatusCodeCategory.CUSTOM;
  
  return null;
}

/**
 * Get human-readable description for a status code
 */
export function getStatusCodeDescription(code: string): string {
  if (isValidStatusCode(code)) {
    return StatusCodeDescription[code];
  }
  return `Unknown status code: ${code}`;
}

/**
 * Check if status code represents a success
 */
export function isSuccessStatusCode(code: string): boolean {
  return getStatusCodeCategory(code) === StatusCodeCategory.SUCCESS;
}

/**
 * Check if status code represents an error
 */
export function isErrorStatusCode(code: string): boolean {
  const category = getStatusCodeCategory(code);
  return category === StatusCodeCategory.CLIENT_ERROR || 
         category === StatusCodeCategory.SERVER_ERROR;
}

/**
 * Check if status code is simulator-related
 */
export function isSimulatorStatusCode(code: string): boolean {
  return getStatusCodeCategory(code) === StatusCodeCategory.SIMULATOR;
}
