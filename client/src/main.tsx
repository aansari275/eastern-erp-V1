import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import SimpleApp from "./SimpleApp";
import "./index.css";

try {
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <SimpleApp />
    </QueryClientProvider>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial;">
      <h1>Eastern Mills ERP</h1>
      <p>Loading application...</p>
      <p style="color: red;">Error: ${error}</p>
    </div>
  `;
}
