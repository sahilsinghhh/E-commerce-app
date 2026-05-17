import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCardMedia from './ProductCardMedia';
import { formatPrice } from '../utils/priceUtils';

export default function ProductList() {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="premium-card overflow-hidden rounded-3xl">
            <div className="h-64 animate-pulse bg-ink-100" />
            <div className="space-y-4 p-5">
              <div className="h-4 w-24 rounded bg-ink-100" />
              <div className="h-6 w-3/4 rounded bg-ink-100" />
              <div className="h-4 w-full rounded bg-ink-100" />
              <div className="h-11 rounded-full bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="status-error">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="premium-card rounded-[2rem] p-10 text-center">
        <p className="font-display text-3xl font-extrabold text-ink-900">The collection is being prepared.</p>
        <p className="mx-auto mt-3 max-w-md text-ink-500">Check back shortly for the next product drop.</p>
      </div>
    );
  }

  const filteredProducts = searchQuery
    ? products.filter((product) =>
        [product.name, product.description, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchQuery))
      )
    : products;

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      showToast({
        title: 'Added to cart',
        message: `${product.name} is ready for checkout.`,
      });
    } catch (err) {
      showToast({
        title: 'Could not add item',
        message: err.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Featured products</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">
            {searchQuery ? `Results for "${searchParams.get('search')}"` : 'Curated for decisive buying'}
          </h2>
        </div>
        <p className="max-w-lg text-sm leading-6 text-ink-500">
          Clean product cards, stable image ratios, and prominent actions keep the
          path to cart obvious on every screen.
        </p>
      </div>

      {filteredProducts.length === 0 && (
        <div className="premium-card rounded-[2rem] p-10 text-center">
          <p className="font-display text-3xl font-extrabold text-ink-900">No matching products</p>
          <p className="mx-auto mt-3 max-w-md text-ink-500">
            Try a different product name, category, or description keyword.
          </p>
          <Link to="/products" className="btn-secondary mt-6">
            Clear search
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <article
            key={product._id}
            className="group premium-card overflow-hidden rounded-[1.75rem] transition duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <Link to={`/product/${product._id}`} className="block">
              <div className="relative">
                <ProductCardMedia product={product} />
                <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-bold text-ink-700 shadow-sm backdrop-blur">
                  {product.category}
                </span>
              </div>
            </Link>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-extrabold text-ink-900">
                    {product.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-500">
                    {product.description}
                  </p>
                </div>
                <span className="rounded-2xl bg-ink-900 px-3 py-2 text-sm font-extrabold text-white">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link to={`/product/${product._id}`} className="btn-secondary py-2.5">
                  Details
                </Link>
                <button
                  type="button"
                  className="btn-primary py-2.5"
                  onClick={() => handleAddToCart(product)}
                >
                  Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
