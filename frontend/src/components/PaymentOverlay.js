import { useState, useEffect } from 'react';
import { processPayment, getPaymentConfig, verifyPaymentSignature } from '../api/paymentApi';
import { payOrder } from '../api/orderApi';
import { formatPrice } from '../utils/priceUtils';

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentOverlay({ order, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ keyId: '', isSimulated: true });
  
  // Simulated Sandbox state
  const [showSimulatedUI, setShowSimulatedUI] = useState(false);
  const [simulatedStep, setSimulatedStep] = useState('options'); // options | card | upi | processing | success
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Fetch payment config on load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getPaymentConfig();
        if (data.success) {
          setConfig(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch payment configuration', err);
      }
    };
    fetchConfig();
    loadRazorpayScript();
  }, []);

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) {
      val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(val.substring(0, 5));
  };

  // Main payment processing flow
  const handlePaymentInitiate = async () => {
    setLoading(true);
    setError('');

    try {
      const paymentResponse = await processPayment({
        amount: order.totalPrice,
      });

      if (!paymentResponse.success) {
        throw new Error('Payment initialization failed.');
      }

      // If backend is running in simulated sandbox mode, show our premium Razorpay simulator
      if (paymentResponse.data?.mode === 'sandbox' || config.isSimulated) {
        setShowSimulatedUI(true);
        setSimulatedStep('options');
        setLoading(false);
        return;
      }

      // If backend is running in live/test mode with real keys, load Razorpay standard popup
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      const options = {
        key: config.keyId,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: 'ShopHub',
        description: `Order #${order._id.substring(0, 8)}`,
        order_id: paymentResponse.data.orderId,
        handler: async function (response) {
          setLoading(true);
          try {
            // Step 1: Verify payment signature on backend
            const verification = await verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success || verification.data?.verified) {
              // Step 2: Mark order as Paid in database
              const paidOrder = await payOrder(order._id, {
                id: response.razorpay_payment_id,
                status: 'succeeded',
                email_address: order.user?.email || 'customer@shophub.com',
              });
              onSuccess(paidOrder.data);
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (err) {
            setError(err.message || 'Signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: order.user?.name || 'Customer',
          email: order.user?.email || 'customer@shophub.com',
        },
        theme: {
          color: '#07111f',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  // Complete simulated payment checkout
  const handleSimulatedSuccess = async () => {
    setSimulatedStep('processing');
    setError('');

    try {
      // Simulate Razorpay network processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 15)}`;
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;

      // Step 1: Verify on backend
      const verification = await verifyPaymentSignature({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
      });

      if (verification.success || verification.data?.verified || verification.verified) {
        // Step 2: Save paid state to MongoDB
        const paidOrder = await payOrder(order._id, {
          id: mockPaymentId,
          status: 'succeeded',
          email_address: order.user?.email || 'customer@shophub.com',
        });
        
        setSimulatedStep('success');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        onSuccess(paidOrder.data);
      } else {
        throw new Error('Sandbox verification failed.');
      }
    } catch (err) {
      setError(err.message || 'Simulated checkout failed.');
      setSimulatedStep('options');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-md" role="dialog" aria-modal="true">
      {!showSimulatedUI ? (
        <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-glow border border-ink-100 animate-fade-up">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="eyebrow">Razorpay Secure Checkout</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900">Checkout</h2>
            </div>
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink-50 hover:bg-ink-100 text-ink-900 transition"
              type="button"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {error && <div className="status-error mb-5">{error}</div>}

          {/* Sandbox Indicator */}
          {config.isSimulated && (
            <div className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100 text-amber-900 text-sm">
              <p className="font-bold flex items-center gap-2">
                💳 Razorpay Simulated Sandbox Active
              </p>
              <p className="mt-1 leading-relaxed opacity-90">
                Operating without live API credentials. We will launch an interactive mock checkout popup simulating Razorpay's options.
              </p>
            </div>
          )}

          {/* Order Details Summary */}
          <div className="mb-6 rounded-3xl bg-ink-900 p-5 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-sky-100">Order ID: #{order._id.substring(0, 10)}...</p>
              <p className="mt-1 text-xs opacity-75">{order.orderItems?.length || 0} items to ship</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Payable Amount</p>
              <p className="font-display text-2xl font-extrabold text-sky-200">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>

          <button
            onClick={handlePaymentInitiate}
            disabled={loading}
            className="btn-primary w-full py-4 text-base relative overflow-hidden flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Contacting Razorpay servers...
              </>
            ) : (
              <>💳 Pay Now with Razorpay</>
            )}
          </button>

          <p className="mt-4 text-center text-xs font-semibold text-ink-500">
            🔒 Powered by Razorpay. Securing payments in India.
          </p>
        </div>
      ) : (
        /* PREMIUM SIMULATED RAZORPAY POPUP OVERLAY */
        <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-slate-900 text-white shadow-glow border border-slate-800 animate-scale-up font-sans">
          {/* Mock Razorpay Header Banner */}
          <div className="bg-[#0b192c] p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                R
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">Razorpay Checkout</h3>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Demo / Sandbox Mode</p>
              </div>
            </div>
            <button
              onClick={() => setShowSimulatedUI(false)}
              className="text-slate-400 hover:text-white transition text-xs font-bold bg-slate-800/80 px-2.5 py-1 rounded-full"
            >
              Cancel
            </button>
          </div>

          {/* Amount Sub-Header */}
          <div className="bg-[#12223a] px-5 py-4 flex justify-between items-center text-xs">
            <div>
              <p className="text-slate-400">ShopHub Checkout</p>
              <p className="font-semibold text-slate-200 mt-0.5">Order: #{order._id.substring(0, 10)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400">Amount</p>
              <p className="text-base font-extrabold text-blue-400 mt-0.5">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>

          <div className="p-5 min-h-[220px] flex flex-col justify-between">
            {simulatedStep === 'options' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Select Payment Option</p>
                
                <button
                  type="button"
                  onClick={() => setSimulatedStep('card')}
                  className="w-full bg-slate-800/60 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-bold">Cards (Credit / Debit)</p>
                      <p className="text-[10px] text-slate-400">Visa, MasterCard, RuPay, Maestro</p>
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold">➔</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulatedStep('upi')}
                  className="w-full bg-slate-800/60 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📱</span>
                    <div>
                      <p className="text-sm font-bold">UPI / QR</p>
                      <p className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold">➔</span>
                </button>
              </div>
            )}

            {simulatedStep === 'card' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-slate-400 font-bold">Card Details</p>
                  <button onClick={() => setSimulatedStep('options')} className="text-xs text-blue-400 font-bold">Back</button>
                </div>
                <div>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Card Number (4242 4242 ...)"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="Expiry (MM/YY)"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                  />
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="CVV"
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button
                  onClick={handleSimulatedSuccess}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition mt-2 shadow-md shadow-blue-900/40"
                >
                  Pay secure amount
                </button>
              </div>
            )}

            {simulatedStep === 'upi' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-slate-400 font-bold">UPI ID (VPA)</p>
                  <button onClick={() => setSimulatedStep('options')} className="text-xs text-blue-400 font-bold">Back</button>
                </div>
                <div>
                  <input
                    className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm placeholder-slate-500 text-white focus:outline-none focus:border-blue-500 transition"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSimulatedSuccess}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition mt-2 shadow-md shadow-blue-900/40"
                >
                  Pay via UPI
                </button>
              </div>
            )}

            {simulatedStep === 'processing' && (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <svg className="animate-spin h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-bold">Verifying payment with bank...</p>
                  <p className="text-[10px] text-slate-400 mt-1">Please do not refresh or click back</p>
                </div>
              </div>
            )}

            {simulatedStep === 'success' && (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-scale-up">
                <div className="h-14 w-14 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl shadow-glow shadow-emerald-900/40 animate-pulse">
                  ✓
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">Payment Successful!</p>
                  <p className="text-[10px] text-slate-400 mt-1">Redirecting you to ShopHub...</p>
                </div>
              </div>
            )}

            {/* Simulated SSL Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>🛡️ Secure SSL Encryption</span>
              <span>•</span>
              <span>Razorpay Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
