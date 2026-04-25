import React, { useState } from "react";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeError } from "@stripe/stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faLock,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { paymentService } from "../services";

interface StripePaymentModalProps {
  isOpen: boolean;
  feeId: number;
  amount: number;
  invoiceNo: string;
  title: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51234567890abcdefghijklmnop";

const stripePromise = loadStripe(StripePublishableKey);

function StripePaymentForm({
  feeId,
  amount,
  invoiceNo,
  onClose,
  onSuccess,
}: Omit<StripePaymentModalProps, "isOpen" | "title">) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setError("Stripe is not loaded");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent on backend
      const intentResponse = await paymentService.createPaymentIntent(
        feeId,
        "pkr",
      );

      // Step 2: Confirm payment with Stripe
      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(intentResponse.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {},
          },
        });

      if (confirmError) {
        setError(
          confirmError.message || "An error occurred during payment processing",
        );
        setIsProcessing(false);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError(
          `Payment failed with status: ${paymentIntent?.status || "unknown"}`,
        );
        setIsProcessing(false);
        return;
      }

      // Step 3: Confirm on backend
      const confirmResponse = await paymentService.confirmPayment(
        feeId,
        intentResponse.clientSecret,
        paymentIntent.id,
      );

      if (confirmResponse.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError("Failed to confirm payment on server");
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const maybeError = err as {
          response?: { data?: { message?: string | string[] } };
        };
        const message = maybeError.response?.data?.message;
        if (Array.isArray(message)) {
          setError(message[0] || "Payment failed");
        } else if (typeof message === "string") {
          setError(message);
        } else {
          setError("Payment failed");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Payment failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {success ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "#f0fdf4",
            borderRadius: "10px",
            border: "1px solid #bbf7d0",
          }}
        >
          <FontAwesomeIcon
            icon={faCheckCircle}
            size="3x"
            color="#10b981"
            style={{ marginBottom: "1rem" }}
          />
          <h3 style={{ color: "#166534", margin: "0.5rem 0" }}>
            Payment Successful!
          </h3>
          <p style={{ color: "#059669", margin: "0.5rem 0" }}>
            Invoice {invoiceNo} has been paid.
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#f9fafb",
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={() => void handlePayment()}
            disabled={isProcessing || !stripe}
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} /> Pay Rs. {amount}
              </>
            )}
          </button>

          <p
            style={{
              fontSize: "0.8rem",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            <FontAwesomeIcon icon={faLock} /> Secure payment powered by Stripe
          </p>
        </>
      )}
    </div>
  );
}

export default function StripePaymentModal({
  isOpen,
  feeId,
  amount,
  invoiceNo,
  title,
  onClose,
  onSuccess,
}: StripePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#111827" }}>
              Pay Invoice
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0 0",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              {invoiceNo} • {title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div
          style={{
            background: "#f3f4f6",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.5rem 0",
              color: "#6b7280",
              fontSize: "0.9rem",
            }}
          >
            Amount Due
          </p>
          <h3 style={{ margin: 0, fontSize: "2rem", color: "#111827" }}>
            Rs. {amount}
          </h3>
        </div>

        <Elements stripe={stripePromise}>
          <StripePaymentForm
            feeId={feeId}
            amount={amount}
            invoiceNo={invoiceNo}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </Elements>
      </div>
    </div>
  );
}
