/**
 * Utility script to verify Frontend environment variables
 * Run this in the browser console to debug Frontend API connections
 */

// Función para mostrar información de variables de entorno
function showEnvVars() {
  console.group("🔍 Frontend Environment Variables");
  
  console.log("📍 Current Environment:", import.meta.env.MODE);
  console.log("🔐 DEV Mode:", import.meta.env.DEV);
  console.log("🔨 PROD Mode:", import.meta.env.PROD);
  
  console.group("📡 API URLs");
  console.log("VITE_API_URL:", import.meta.env.VITE_API_URL || "❌ Not set (using default)");
  console.log("VITE_AUTH_API_URL:", import.meta.env.VITE_AUTH_API_URL || "❌ Not set (using default)");
  console.groupEnd();
  
  // Import the functions to see actual URLs being used
  console.group("📊 Actual URLs Being Used");
  try {
    // Note: This is pseudo-code, adjust based on your actual import
    console.log("Would need to import from apiInstance.ts to show actual URLs");
  } catch (e) {
    console.log("Note: To see actual URLs, import from apiInstance.ts");
  }
  console.groupEnd();
  
  console.groupEnd();
}

// Función para probar conexión a los APIs
async function testApiConnection() {
  console.group("🧪 Testing API Connections");
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const authUrl = import.meta.env.VITE_AUTH_API_URL || apiUrl;
  
  console.log("Testing Main API:", apiUrl);
  try {
    const response = await fetch(`${apiUrl}/health`, { method: "GET" });
    console.log(`✅ Main API reachable (Status: ${response.status})`);
  } catch (error) {
    console.error(`❌ Main API unreachable:`, error);
  }
  
  console.log("\nTesting Auth API:", authUrl);
  try {
    const response = await fetch(`${authUrl}/auth/health`, { method: "GET" });
    console.log(`✅ Auth API reachable (Status: ${response.status})`);
  } catch (error) {
    console.error(`❌ Auth API unreachable:`, error);
  }
  
  console.groupEnd();
}

// Export functions for use in browser console
window.debugFrontend = {
  showEnvVars,
  testApiConnection,
  help: () => {
    console.log(`
🎯 Frontend Debugging Tools

Available commands:
1. debugFrontend.showEnvVars()
   - Shows all environment variables
   
2. debugFrontend.testApiConnection()
   - Tests connectivity to API endpoints
   
3. debugFrontend.help()
   - Shows this help message

Example usage in console:
> debugFrontend.showEnvVars()
> debugFrontend.testApiConnection()
    `);
  }
};

// Log availability message
console.log("%c🚀 Frontend Debug Tools Loaded", "color: green; font-size: 14px; font-weight: bold;");
console.log("%cRun debugFrontend.help() for available commands", "color: blue;");
