import { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct } from '../../api/productApi';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/priceUtils';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetchProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const response = await deleteProduct(id);
        if (response.success) {
          setProducts(products.filter((p) => p._id !== id));
        }
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0);

  if (loading) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card rounded-[2rem] p-10 text-center font-bold text-ink-500">
          Loading dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="eyebrow">Admin console</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Product management</h1>
          <p className="mt-2 text-ink-500">Operate inventory, pricing, and launch readiness from one surface.</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      {error && <div className="status-error mb-6">{error}</div>}

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Total products', products.length],
          ['Inventory value', formatPrice(inventoryValue)],
          ['Low stock', products.filter((product) => Number(product.stock) < 10).length],
        ].map(([label, value]) => (
          <div key={label} className="premium-card rounded-3xl p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{label}</p>
            <p className="mt-3 font-display text-3xl font-extrabold text-ink-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="premium-card overflow-hidden rounded-[2rem]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100">
            <thead className="bg-ink-900 text-white">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Actions'].map((head) => (
                  <th key={head} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.16em]">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-white/70">
              {products.map((product) => (
                <tr key={product._id} className="transition hover:bg-sky-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                      <div>
                        <p className="font-bold text-ink-900">{product.name}</p>
                        <p className="line-clamp-1 max-w-xs text-sm text-ink-500">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-ink-600">{product.category}</td>
                  <td className="px-5 py-4 text-sm font-bold text-ink-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${Number(product.stock) < 10 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/products/edit/${product._id}`} className="btn-secondary px-3 py-2">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100" type="button">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
