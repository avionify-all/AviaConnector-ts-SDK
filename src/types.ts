/**
 * Message envelope for WebSocket communication
 */
export interface MessageEnvelope<T = unknown> {
  type: string;
  ts?: number;
  data?: T;
}

/**
 * Aircraft data from flight simulator
 * All properties are optional and can be extended as needed
 */
export interface AircraftData {
  //
  // Core Flight Parameters
  //
  PLANE_ALTITUDE?: number;               // feet MSL
  PLANE_LATITUDE?: number;               // degrees
  PLANE_LONGITUDE?: number;              // degrees
  PLANE_ALT_ABOVE_GROUND?: number;       // feet AGL
  AIRSPEED_INDICATED?: number;           // knots IAS
  AIRSPEED_TRUE?: number;                // knots TAS
  VERTICAL_SPEED?: number;               // feet per second
  GROUND_VELOCITY?: number;              // feet per second

  PLANE_HEADING_DEGREES_TRUE?: number;   // degrees
  PLANE_PITCH_DEGREES?: number;          // degrees
  PLANE_BANK_DEGREES?: number;           // degrees

  //
  // Ambient / Environment
  //
  AMBIENT_WIND_DIRECTION?: number;       // degrees
  AMBIENT_WIND_VELOCITY?: number;        // knots
  AMBIENT_TEMPERATURE?: number;          // °C
  AMBIENT_PRESSURE?: number;             // inHg

  //
  // Engine System
  //
  ENG_N1_RPM_1?: number;                 // percent
  ENG_N1_RPM_2?: number;                 // percent
  ENG_N1_RPM_3?: number;                 // percent
  ENG_N1_RPM_4?: number;                 // percent

  ENG_N2_RPM_1?: number;                 // percent
  ENG_N2_RPM_2?: number;                 // percent
  ENG_N2_RPM_3?: number;                 // percent
  ENG_N2_RPM_4?: number;                 // percent

  NUMBER_OF_ENGINES?: number;            // total engines

  GENERAL_ENG_COMBUSTION_1?: boolean;    // combustion on/off
  GENERAL_ENG_COMBUSTION_2?: boolean;
  GENERAL_ENG_COMBUSTION_3?: boolean;
  GENERAL_ENG_COMBUSTION_4?: boolean;

  //
  // Forces
  //
  G_FORCE?: number;                      // GForce

  //
  // Aircraft Surfaces
  //
  TRAILING_EDGE_FLAPS_LEFT_ANGLE?: number;   // degrees
  TRAILING_EDGE_FLAPS_RIGHT_ANGLE?: number;  // degrees
  SPOILERS_HANDLE_POSITION?: number;     // percent (0 = down)

  //
  // Gear
  //
  GEAR_HANDLE_POSITION?: number;         // 1 = down, 0 = up
  GEAR_CENTER_POSITION?: number;         // percent
  GEAR_LEFT_POSITION?: number;           // percent
  GEAR_RIGHT_POSITION?: number;          // percent

  //
  // Switches & Lights
  //
  SIM_ON_GROUND?: boolean;
  
  LIGHT_NAV_ON?: boolean;
  LIGHT_BEACON_ON?: boolean;
  LIGHT_STROBE_ON?: boolean;
  LIGHT_TAXI_ON?: boolean;
  LIGHT_LANDING_ON?: boolean;

  FLAPS_HANDLE_INDEX?: number;           // flap detent index

  SPOILERS_ARMED?: boolean;            // spoilers armed switch
  SPOILER_AVAILABLE?: boolean;         // spoiler available switch
  WARNING_FUEL?: boolean;               // warning fuel switch
  PLANE_ALT_ABOVE_GROUND_MINUS_CG?: number; // feet

  //
  // Aircraft Metadata
  //
  TITLE?: string;                        // aircraft title string
  ATC_MODEL?: string;                    // ATC model string
}

/**
 * Simulator connection status
 */
export interface SimulatorStatus {
  last_error?: number; // error code
  simulator_connected?: boolean; // when simconnect bridge is open and data can be requested
  simulator_loaded?: boolean; // when the simulator is turned on, but the connector isnt connected yet, because the simconnect bridge is not ready
  simulator_name?: string; // simulator name
}

export interface ErrorType{
  message?: string;
  function_name?: string;
  possible_issue?: string;
}

/**
 * Pong response data from ping request
 */
export interface PongResponse {
 payload: {
   simulator: 'MSFS' | 'P3DV5' | string;
 }
}
