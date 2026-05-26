import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import { initializeRazorpayPayment } from "../../components/ClientDashboard/RazorpayIntegration";
import {
  MdArrowBack,
  MdCheck,
  MdRocket,
  MdStar,
  MdWorkspacePremium,
  MdLock,
} from "react-icons/md";
import "./Dashboard.css";

const SERVICE_TIERS = [
  {
    id: 1,
    name: "Basic",
    price: "₹5,000",
    priceNum: 5000,
    icon: <MdRocket />,
    color: "#60a5fa",
    features: [
      "Single Page Website",
      "Responsive Design",
      "Basic Animations",
      "1 Revision",
      "3 Days Delivery",
    ],
  },
  {
    id: 2,
    name: "Standard",
    price: "₹15,000",
    priceNum: 15000,
    icon: <MdStar />,
    color: "#fbbf24",
    popular: true,
    features: [
      "Up to 5 Pages",
      "Responsive Design",
      "Advanced Animations",
      "3 Revisions",
      "CMS Integration",
      "SEO Optimized",
      "7 Days Delivery",
    ],
  },
  {
    id: 3,
    name: "Premium",
    price: "₹30,000",
    priceNum: 30000,
    icon: <MdWorkspacePremium />,
    color: "#a78bfa",
    features: [
      "Up to 10 Pages",
      "Full-Stack Web App",
      "Custom Animations",
      "Unlimited Revisions",
      "Database & Auth",
      "Payment Integration",
      "Admin Dashboard",
      "Priority Support",
      "14 Days Delivery",
    ],
  },
];

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedTier, setSelectedTier] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("select"); // select | details | processing
  const [orderId, setOrderId] = useState(null);

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setStep("details");
  };

  const handleSubmitOrder = async () => {
    if (!title || !description || !selectedTier) return;
    setSubmitting(true);

    try {
      // Create order in database
      const { data: order, error } = await supabase
        .from("orders")
        .insert([
          {
            client_id: user.id,
            tier_id: selectedTier.id,
            title,
            description,
            status: "pending",
            payment_status: "unpaid",
            amount_paid: selectedTier.priceNum,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setOrderId(order.id);
      setStep("processing");

      // Initialize Razorpay payment
      initializeRazorpayPayment({
        amount: selectedTier.priceNum,
        orderId: order.id,
        title: title,
        email: user.email,
        name: profile?.full_name || "Client",
        phone: profile?.phone || "",
        onSuccess: () => {
          alert(
            "Payment successful! Your project has been created. Redirecting to dashboard..."
          );
          navigate("/dashboard");
        },
        onError: (err) => {
          alert(
            "Payment failed or cancelled: " +
              (err?.message || "Unknown error")
          );
          navigate("/dashboard");
        },
      });
    } catch (err) {
      alert("Error placing order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-page">
      <Link to="/dashboard" className="order-back-btn">
        <MdArrowBack /> Back to Dashboard
      </Link>

      <div className="order-content">
        {/* Step 1: Select Tier */}
        {step === "select" && (
          <>
            <div className="order-header">
              <h1>Choose Your Plan</h1>
              <p>Select a service tier that best fits your project needs</p>
            </div>

            <div className="order-tiers">
              {SERVICE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`order-tier-card ${
                    selectedTier?.id === tier.id ? "selected" : ""
                  } ${tier.popular ? "popular" : ""}`}
                  onClick={() => handleSelectTier(tier)}
                >
                  {tier.popular && (
                    <div className="tier-badge">Most Popular</div>
                  )}
                  <div
                    className="tier-icon"
                    style={{ background: `${tier.color}15`, color: tier.color }}
                  >
                    {tier.icon}
                  </div>
                  <h2>{tier.name}</h2>
                  <div className="tier-price">
                    <span className="price">{tier.price}</span>
                    <span className="price-label">one-time</span>
                  </div>
                  <ul className="tier-features">
                    {tier.features.map((f, i) => (
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

        {/* Step 2: Project Details */}
        {step === "details" && (
          <>
            <div className="order-header">
              <h1>Project Details</h1>
              <p>
                Tell me about your project - {selectedTier?.name} plan (
                {selectedTier?.price})
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
                    Secure payment via <strong>Razorpay</strong>
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
                    : `Pay & Place Order - ${selectedTier?.price}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Payment Processing */}
        {step === "processing" && (
          <div className="order-payment-processing">
            <div className="payment-spinner"></div>
            <h2>Redirecting to Payment</h2>
            <p>
              Please wait while we redirect you to Razorpay's secure payment
              gateway...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceOrder;
