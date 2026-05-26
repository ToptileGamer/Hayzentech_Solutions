import { supabase } from "../../supabase/client";

/**
 * Initialize Razorpay payment for an order.
 * This function loads the Razorpay checkout SDK and opens the payment modal.
 *
 * @param {Object} options
 * @param {number} options.amount - Amount in INR (e.g., 5000 for ₹5,000)
 * @param {string} options.orderId - The Supabase order UUID
 * @param {string} options.title - Project title (for display)
 * @param {string} options.email - Customer email
 * @param {string} options.name - Customer name
 * @param {string} options.phone - Customer phone (optional)
 * @param {Function} options.onSuccess - Callback after successful payment
 * @param {Function} options.onError - Callback on payment error
 */
export const initializeRazorpayPayment = ({
  amount,
  orderId,
  title,
  email,
  name,
  phone,
  onSuccess,
  onError,
}) => {
  const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!razorpayKeyId) {
    console.warn(
      "Razorpay key not configured. Please set VITE_RAZORPAY_KEY_ID in .env"
    );
    // Fallback: simulate payment success for development
    simulatePayment({ orderId, amount, onSuccess, onError });
    return;
  }

  // Open Razorpay checkout (load script if not already loaded)
  const openRazorpay = () => {
    const options = {
      key: razorpayKeyId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      name: "HayzenTech Solutions",
      description: title,
      image: "/logo.png",
      order_id: "",
      handler: async function (response) {
        const { error } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            status: "approved",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);

        if (error) {
          console.error("Error updating order payment:", error);
          onError?.(error);
          return;
        }

        await createProjectFromOrder(orderId);
        onSuccess?.(response);
      },
      prefill: {
        name: name,
        email: email,
        contact: phone || "",
      },
      theme: {
        color: "#5eead4",
      },
      modal: {
        ondismiss: function () {
          onError?.(new Error("Payment cancelled by user"));
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Check if Razorpay script is already loaded
  if (window.Razorpay) {
    openRazorpay();
    return;
  }

  // Load script dynamically if not loaded yet
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = openRazorpay;
  script.onerror = () => {
    console.error("Failed to load Razorpay SDK");
    onError?.(new Error("Failed to load payment gateway"));
  };
  document.body.appendChild(script);
};

/**
 * Simulate payment for development/testing when Razorpay key is not set
 */
const simulatePayment = async ({ orderId, amount, onSuccess, onError }) => {
  console.log("🧪 Simulating payment...");

  // Simulate payment delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id: "sim_pay_" + Date.now(),
        razorpay_order_id: "sim_order_" + Date.now(),
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;

    await createProjectFromOrder(orderId);
    onSuccess?.({ razorpay_payment_id: "simulated" });
  } catch (err) {
    console.error("Simulation error:", err);
    onError?.(err);
  }
};

/**
 * Create a project after successful payment
 */
const createProjectFromOrder = async (orderId) => {
  // Fetch the order to get details
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return;

  // Create the project
  const { error: projectError } = await supabase.from("projects").insert([
    {
      order_id: order.id,
      client_id: order.client_id,
      title: order.title,
      description: order.description,
      status: "not_started",
    },
  ]);

  if (projectError) {
    console.error("Error creating project:", projectError);
  }
};

export default initializeRazorpayPayment;
