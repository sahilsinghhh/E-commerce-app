import { useParams, Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { id } = useParams();

  return (
    <main className="page-wrap py-16">
      <section className="premium-card mx-auto max-w-3xl rounded-[2rem] p-8 text-center sm:p-12">
        <span className="eyebrow">Order confirmed</span>
        <h1 className="mt-5 font-display text-5xl font-extrabold text-ink-900">Order placed</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-ink-500">
          Thank you for your purchase. Your order ID is{' '}
          <strong className="font-bold text-ink-900">#{id}</strong>.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">Continue shopping</Link>
          <Link to="/orders" className="btn-secondary">View orders</Link>
        </div>
      </section>
    </main>
  );
}
