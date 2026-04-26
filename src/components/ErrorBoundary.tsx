import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch runtime errors and display them gracefully
 */
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "2rem",
              maxWidth: "500px",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#d32f2f", marginBottom: "1rem" }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              An unexpected error occurred. We apologize for the inconvenience.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                <p
                  style={{
                    color: "#d32f2f",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                  }}
                >
                  Error: {this.state.error.message}
                </p>
                <pre
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    margin: "0.5rem 0",
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.25rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "500",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#1565c0")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1976d2")
              }
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
