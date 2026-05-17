import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../api/orderApi';
import { formatPrice } from '../utils/priceUtils';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await fetchMyOrders();
        if (response.success) {
          setOrders(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="page-wrap py-16">
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="premium-card h-32 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Orders</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Order history</h1>
        </div>
        <Link to="/account" className="btn-secondary">Back to account</Link>
      </div>

      {error && <div className="status-error mb-6">{error}</div>}

      {orders.length === 0 ? (
        <section className="premium-card rounded-[2rem] p-10 text-center">
          <h2 className="font-display text-3xl font-extrabold text-ink-900">No orders yet</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-500">Your completed checkouts will appear here.</p>
          <Link to="/products" className="btn-primary mt-8">Browse products</Link>
        </section>
      ) : (
        <section className="grid gap-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="premium-card rounded-[1.75rem] p-5 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                    #{order._id}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-extrabold text-ink-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-ink-500">
                    {order.orderItems?.length || 0} items
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {order.isPaid ? 'Paid' : 'Payment pending'}
                  </span>
                  <span className="font-display text-2xl font-extrabold text-ink-900">
                    {formatPrice(order.totalPrice)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
