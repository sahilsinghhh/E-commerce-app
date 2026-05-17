import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchOrderById } from '../api/orderApi';
import { formatPrice } from '../utils/priceUtils';
import PaymentOverlay from '../components/PaymentOverlay';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await fetchOrderById(id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card h-96 animate-pulse rounded-[2rem]" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card rounded-[2rem] p-10 text-center">
          <div className="status-error text-left">{error || 'Order not found'}</div>
          <Link to="/orders" className="btn-secondary mt-6">Back to orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Order detail</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">#{order._id}</h1>
          <p className="mt-2 text-ink-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <Link to="/orders" className="btn-secondary">Back to orders</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <section className="premium-card rounded-[2rem] p-5 sm:p-6">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Items</h2>
          <div className="mt-5 divide-y divide-ink-100">
            {order.orderItems.map((item) => (
              <div key={item.product} className="grid gap-4 py-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center">
                <img src={item.image} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                <div>
                  <p className="font-bold text-ink-900">{item.name}</p>
                  <p className="mt-1 text-sm font-semibold text-ink-500">Qty {item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <p className="font-display text-xl font-extrabold text-ink-900">
                  {formatPrice(item.quantity * item.price)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="premium-card h-fit rounded-[2rem] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Summary</h2>
          <div className="mt-5 space-y-3 text-sm font-semibold">
            <div className="flex justify-between text-ink-500">
              <span>Items</span>
              <span className="text-ink-900">{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>Shipping</span>
              <span className="text-ink-900">{formatPrice(order.shippingPrice)}</span>
            </div>
            <div className="border-t border-ink-100 pt-3">
              <div className="flex justify-between text-base text-ink-900">
                <span>Total</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-ink-100 bg-white/70 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">Payment status</p>
            {order.isPaid ? (
              <div className="mt-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Paid
                </span>
                <p className="mt-2 text-xs text-ink-500">
                  Transaction completed on {new Date(order.paidAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  Payment pending
                </span>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="btn-primary mt-4 w-full py-2.5 text-sm"
                >
                  Pay Now
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-3xl bg-ink-900 p-5 text-white">
            <p className="text-sm font-bold text-sky-100">Ship to</p>
            <p className="mt-2 text-sm leading-6">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
        </aside>
      </div>

      {showPaymentModal && order && (
        <PaymentOverlay
          order={order}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(paidOrder) => {
            setOrder(paidOrder);
            setShowPaymentModal(false);
          }}
        />
      )}
    </main>
  );
}
