import { Component, type ErrorInfo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import CreateTrip from "./pages/CreateTrip";
import TripBoard from "./pages/TripBoard";
import NotFound from "./pages/NotFound";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#faf7f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺</div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#1a3647",
                marginBottom: 8,
              }}
            >
              something went wrong
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#9aacb5",
                marginBottom: 24,
              }}
            >
              try refreshing, or head back home.
            </p>
            <a
              href="/"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#c17c4e",
                textDecoration: "none",
              }}
            >
              ← back to TripBoard
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/new" element={<CreateTrip />} />
          <Route path="/t/:slug" element={<TripBoard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
