import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test component
function TestApp() {
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
      <p style={{ fontSize: '1.5em', marginBottom: '20px' }}>✅ React App Loading Successfully!</p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p><strong>Status:</strong> Application is working!</p>
        <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> Production</p>
        <button 
          onClick={() => alert('Button works! App is functional.')} 
          style={{
            background: '#4ade80',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

try {
  console.log("Starting Eastern Mills ERP...");
  createRoot(document.getElementById("root")!).render(<TestApp />);
  console.log("Eastern Mills ERP loaded successfully!");
} catch (error) {
  console.error("Failed to render app:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial; background: #f87171; color: white; min-height: 100vh;">
      <h1>Eastern Mills ERP - Error</h1>
      <p>Failed to load application</p>
      <p><strong>Error:</strong> ${error}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    </div>
  `;
}
