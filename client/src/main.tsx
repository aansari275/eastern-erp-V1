import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import "./index.css";

// Import the full app but with better error handling
let SimpleApp: any = null;

// Lazy load the main app to catch import errors
async function loadApp() {
  try {
    const module = await import("./SimpleApp");
    SimpleApp = module.default;
    return SimpleApp;
  } catch (error) {
    console.error("Failed to load SimpleApp:", error);
    throw error;
  }
}

// Fallback component
function LoadingApp() {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>🏭 Eastern Mills ERP</h1>
      <p style={{ fontSize: '1.5em', marginBottom: '20px' }}>Loading application...</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p>Please wait while we load your ERP system.</p>
      </div>
    </div>
  );
}

// Error fallback component
function ErrorApp({ error }: { error: any }) {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: '#dc2626',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>🏭 Eastern Mills ERP</h1>
      <p style={{ fontSize: '1.5em', marginBottom: '20px' }}>Application Error</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p><strong>Error:</strong> {error?.message || String(error)}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#fbbf24',
            color: '#1f2937',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Main initialization
async function initializeApp() {
  const root = createRoot(document.getElementById("root")!);
  
  try {
    console.log("Starting Eastern Mills ERP...");
    
    // Show loading first
    root.render(<LoadingApp />);
    
    // Load the main app
    const App = await loadApp();
    
    // Render the main app
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    console.log("Eastern Mills ERP loaded successfully!");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    root.render(<ErrorApp error={error} />);
  }
}

// Start the app
initializeApp();
