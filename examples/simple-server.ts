import { AviaConnectorServer } from "../src/server/AviaConnectorServer";

// Create a simple server that listens for aircraft data
let pingInterval: NodeJS.Timeout | undefined;
let dataInterval: NodeJS.Timeout | undefined;

const server = new AviaConnectorServer({
  port: 8765,
  host: "0.0.0.0",
  
  onListening: (url) => {
    console.log(`✈️  AviaConnector Server listening on ${url}`);
    console.log(`Waiting for AviaConnector to connect...`);
  },
  
  onConnection: () => {
    console.log(`✅ AviaConnector connected!`);
    
    // Clear any existing intervals just in case
    if (pingInterval) clearInterval(pingInterval);
    if (dataInterval) clearInterval(dataInterval);

    // Send a ping to detect simulator type
    pingInterval = setInterval(() => {
      server.ping();
    }, 15000);
    
    // Request aircraft data every second
    dataInterval = setInterval(() => {
      
        server.requestSimulatorStatus();
        if(server.isSimulatorConnected())
        {
          server.requestAircraftData();
        }
        
      
    }, 2000);
  },
  
  onDisconnect: () => {
    console.log(`❌ AviaConnector disconnected`);
    if (pingInterval) clearInterval(pingInterval);
    if (dataInterval) clearInterval(dataInterval);
    pingInterval = undefined;
    dataInterval = undefined;
  },
  
  onSimulatorStatus: (status) => {
    if (status.simulator_loaded) {
      console.log(`🎮 Simulator connected: ${status.simulator_name}`);
      console.log(`   Loaded: ${status.simulator_loaded ? 'Yes' : 'No'}`);
      console.log(`   Last Error Code: ${status.last_error}`);  
      console.log(`   Is Connected: ${server.isSimulatorConnected() ? 'Yes' : 'No'}`);
    } else {
      console.log(`🎮 Simulator disconnected`);
    }
  },
  
  onPong: (response) => {
    console.log(`🏓 Pong received! Simulator type: ${JSON.stringify(response)}`);
  },
  
  onAircraftData: (data) => {
    console.log(`\n📊 Aircraft Data:`);

// ---- Metadata ----
console.log(`  TITLE: ${data.TITLE}`);
console.log(`  ICAO: ${data.ATC_MODEL}`);

// ---- Position ----
console.log(`  Altitude: ${data.PLANE_ALTITUDE?.toFixed(0)} ft`);
console.log(`  Position: ${data.PLANE_LATITUDE?.toFixed(6)}°, ${data.PLANE_LONGITUDE?.toFixed(6)}°`);
console.log(`  AGL Altitude: ${data.PLANE_ALT_ABOVE_GROUND?.toFixed(0)} ft`);

// ---- Motion ----
console.log(`  Airspeed Indicated: ${data.AIRSPEED_INDICATED?.toFixed(0)} kts`);
console.log(`  Airspeed True: ${data.AIRSPEED_TRUE?.toFixed(0)} kts`);
console.log(`  Ground Velocity: ${data.GROUND_VELOCITY?.toFixed(0)} ft/s`);
console.log(`  Vertical Speed: ${data.VERTICAL_SPEED?.toFixed(0)} ft/s`);

console.log(`  Heading True: ${data.PLANE_HEADING_DEGREES_TRUE?.toFixed(0)}°`);
console.log(`  Pitch: ${data.PLANE_PITCH_DEGREES?.toFixed(1)}°`);
console.log(`  Bank: ${data.PLANE_BANK_DEGREES?.toFixed(1)}°`);

// ---- Environment ----
console.log(`  Ambient Wind Dir: ${data.AMBIENT_WIND_DIRECTION?.toFixed(0)}°`);
console.log(`  Ambient Wind Vel: ${data.AMBIENT_WIND_VELOCITY?.toFixed(0)} kts`);
console.log(`  Ambient Temp: ${data.AMBIENT_TEMPERATURE?.toFixed(1)} °C`);
console.log(`  Ambient Pressure: ${data.AMBIENT_PRESSURE?.toFixed(2)} inHg`);

// ---- Forces ----
console.log(`  G Force: ${data.G_FORCE?.toFixed(2)} G`);

// ---- Engine N1 ----
console.log(`  N1 RPM: [${data.ENG_N1_RPM_1}, ${data.ENG_N1_RPM_2}, ${data.ENG_N1_RPM_3}, ${data.ENG_N1_RPM_4}]`);

// ---- Engine N2 ----
console.log(`  N2 RPM: [${data.ENG_N2_RPM_1}, ${data.ENG_N2_RPM_2}, ${data.ENG_N2_RPM_3}, ${data.ENG_N2_RPM_4}]`);

console.log(`  NUMBER_OF_ENGINES: ${data.NUMBER_OF_ENGINES}`);

// ---- Engine Combustion ----
console.log(
  `  Combustion: ENG1=${!!data.GENERAL_ENG_COMBUSTION_1}, ENG2=${!!data.GENERAL_ENG_COMBUSTION_2}, ENG3=${!!data.GENERAL_ENG_COMBUSTION_3}, ENG4=${!!data.GENERAL_ENG_COMBUSTION_4}`
);

// ---- Ground / Gear ----
console.log(`  On Ground: ${data.SIM_ON_GROUND ? 'Yes' : 'No'}`);
console.log(`  Gear Handle: ${data.GEAR_HANDLE_POSITION === 0 ? 'Down' : data.GEAR_HANDLE_POSITION === 1 ? 'Up' : 'Transitioning'}`);

console.log(`  Gear Pos Center: ${data.GEAR_CENTER_POSITION}`);
console.log(`  Gear Pos Left: ${data.GEAR_LEFT_POSITION}`);
console.log(`  Gear Pos Right: ${data.GEAR_RIGHT_POSITION}`);

// ---- Flaps / Spoilers ----
console.log(`  FLAPS_HANDLE_INDEX: ${data.FLAPS_HANDLE_INDEX}`);
console.log(`  Flaps Left Angle: ${data.TRAILING_EDGE_FLAPS_LEFT_ANGLE}°`);
console.log(`  Flaps Right Angle: ${data.TRAILING_EDGE_FLAPS_RIGHT_ANGLE}°`);
console.log(`  Spoilers Handle: ${data.SPOILERS_HANDLE_POSITION}`);

// ---- Lights ----
console.log(
  `  Lights: Nav ${data.LIGHT_NAV_ON ? 'On' : 'Off'}, ` +
  `Beacon ${data.LIGHT_BEACON_ON ? 'On' : 'Off'}, ` +
  `Strobe ${data.LIGHT_STROBE_ON ? 'On' : 'Off'}, ` +
  `Taxi ${data.LIGHT_TAXI_ON ? 'On' : 'Off'}, ` +
  `Landing ${data.LIGHT_LANDING_ON ? 'On' : 'Off'}`
);

  },
  
  onError: (error) => {
    console.error(`❌ Error: ${error.message} (in ${error.function_name}) Possible issue: ${error.possible_issue}`);
  }
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n\nShutting down server...');
  await server.close();
  process.exit(0);
});
