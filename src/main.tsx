import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App.tsx";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 5000,
          }}
        />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
