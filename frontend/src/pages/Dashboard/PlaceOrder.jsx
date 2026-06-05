import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import {
  MdArrowBack,
  MdCheck,
  MdRocket,
  MdStar,
  MdWorkspacePremium,
  MdLock,
} from "react-icons/md";
import "./Dashboard.css";

const ICONS = {
  basic: <MdRocket />,
  standard: <MdStar />,
  premium: <MdWorkspacePremium />,
};

const COLORS = {
  basic: "#60a5fa",
  standard: "#fbbf24",
  premium: "#a78bfa",
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [packages, setPackages] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("select");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await api.getPackages();
      setPackages(data.packages);
    } catch (err) {
      console.error("Failed to load packages:", err);
      addToast("Failed to load service packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setStep("details");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (orderId, amount) => {
    try {
      // Get payment config from backend
      const config = await api.getPaymentConfig();

      if (!config.configured) {
        // Simulated payment
        addToast("Processing simulated payment...", "info");
        await new Promise((r) => setTimeout(r, 2000));
        await api.verifyPayment(orderId);
        addToast("Payment successful! (Simulated)", "success");
        return true;
      }

      // Create Razorpay order on backend
      const orderData = await api.createPaymentOrder(orderId);
      if (orderData.simulated) {
        await new Promise((r) => setTimeout(r, 2000));
        await api.verifyPayment(orderId);
        addToast("Payment successful! (Simulated)", "success");
        return true;
      }

      // Load Razorpay and open checkout
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        addToast("Failed to load payment gateway", "error");
        return false;
      }

      return new Promise((resolve) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "HayzenTech Solutions",
          description: selectedTier?.name || title,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            try {
              await api.verifyPayment(orderId, response.razorpay_payment_id, response.razorpay_order_id);
              addToast("Payment successful!", "success");
              resolve(true);
            } catch (err) {
              addToast("Payment verification failed", "error");
              resolve(false);
            }
          },
          prefill: {
            name: user?.full_name || "",
            email: user?.email || "",
          },
          theme: { color: "#5eead4" },
          modal: {
            ondismiss: function () {
              resolve(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (err) {
      console.error("Payment error:", err);
      addToast(err.message || "Payment failed", "error");
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    if (!title || !description || !selectedTier) return;
    setSubmitting(true);

    try {
      // Create order on backend
      const orderData = await api.createOrder(
        selectedTier.id,
        title,
        description
      );

      const orderId = orderData.order.id;
      setStep("processing");

      // Process payment
      const paid = await handlePayment(orderId, selectedTier.price);

      if (paid) {
        addToast(`Order placed! Project "${title}" created.`, "success");
        navigate("/dashboard");
      } else {
        addToast("Payment was cancelled or failed", "error");
        setStep("details");
      }
    } catch (err) {
      addToast(err.message || "Error placing order", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="order-page">
        <div className="dash-loading">
          <div className="dash-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <Link to="/dashboard" className="order-back-btn">
        <MdArrowBack /> Back to Dashboard
      </Link>

      <div className="order-content">
        {step === "select" && (
          <>
            <div className="order-header">
              <h1>Choose Your Plan</h1>
              <p>Select a service tier that best fits your project needs</p>
            </div>

            <div className="order-tiers">
              {packages.map((tier) => (
                <div
                  key={tier.id}
                  className={`order-tier-card ${
                    selectedTier?.id === tier.id ? "selected" : ""
                  } ${tier.is_popular ? "popular" : ""}`}
                  onClick={() => handleSelectTier(tier)}
                >
                  {tier.is_popular && (
                    <div className="tier-badge">Most Popular</div>
                  )}
                  <div
                    className="tier-icon"
                    style={{
                      background: `${COLORS[tier.slug] || "#5eead4"}15`,
                      color: COLORS[tier.slug] || "#5eead4",
                    }}
                  >
                    {ICONS[tier.slug] || <MdRocket />}
                  </div>
                  <h2>{tier.name}</h2>
                  <div className="tier-price">
                    <span className="price">₹{Number(tier.price).toLocaleString()}</span>
                    <span className="price-label">one-time</span>
                  </div>
                  <ul className="tier-features">
                    {(tier.features || []).map((f, i) => (
                      <li key={i}>
                        <MdCheck /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="tier-select-btn">Get Started</button>
                </div>
              ))}
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <div className="order-header">
              <h1>Project Details</h1>
              <p>
                Tell us about your project - {selectedTier?.name} plan (₹
                {Number(selectedTier?.price).toLocaleString()})
              </p>
            </div>

            <div className="order-form">
              <div className="order-form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., Portfolio Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="order-form-group">
                <label>Project Description</label>
                <textarea
                  placeholder="Describe your project in detail... What features do you need? What's the deadline? Any specific design preferences?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  required
                />
              </div>

              <div className="order-form-group">
                <div className="payment-summary">
                  <MdLock />
                  <span>
                    Secure payment via Razorpay
                  </span>
                </div>
              </div>

              <div className="order-form-actions">
                <button
                  className="order-form-back"
                  onClick={() => setStep("select")}
                >
                  Change Plan
                </button>
                <button
                  className="order-form-submit"
                  onClick={handleSubmitOrder}
                  disabled={submitting || !title || !description}
                >
                  {submitting
                    ? "Processing..."
                    : `Place Order - ₹${Number(selectedTier?.price).toLocaleString()}`}
                </button>
              </div>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="order-payment-processing">
            <div className="payment-spinner"></div>
            <h2>Processing Your Order</h2>
            <p>
              Please wait while we process your payment...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
