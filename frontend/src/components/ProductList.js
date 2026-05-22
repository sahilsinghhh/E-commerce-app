import { useEffect, useState, useRef, useCallback } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const categoryFilter = searchParams.get('category') || 'All';
  const sortFilter = searchParams.get('sort') || 'newest';

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProducts([]);
    loadProducts(1);
  }, [searchParams]);

  useEffect(() => {
    if (page > 1) {
      loadProducts(page);
    }
  }, [page]);

  const loadProducts = async (currentPage) => {
    try {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      const queryObj = { page: currentPage, limit: 9 };

      const search = searchParams.get('search');
      if (search) queryObj.keyword = search;

      const category = searchParams.get('category');
      if (category && category !== 'All') queryObj.category = category;

      const sort = searchParams.get('sort');
      if (sort) queryObj.sort = sort;

      const response = await fetchProducts(queryObj);
      if (response.success) {
        setProducts((prev) =>
          currentPage === 1 ? response.data : [...prev, ...response.data]
        );
        setHasMore(response.hasMore);
      }
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const updateSearchParams = (key, value) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value && value !== 'All') {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    // Update the URL without reloading the page
    window.history.pushState(null, '', `?${current.toString()}`);
    // Manually trigger a re-render since we are using useSearchParams
    const event = new PopStateEvent('popstate');
    window.dispatchEvent(event);
  };

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
            {searchParams.get('search') ? `Results for "${searchParams.get('search')}"` : 'Curated for decisive buying'}
          </h2>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex gap-4">
          <select
            className="input-field max-w-[150px] cursor-pointer bg-white"
            value={categoryFilter}
            onChange={(e) => updateSearchParams('category', e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home</option>
            <option value="Accessories">Accessories</option>
          </select>

          <select
            className="input-field max-w-[150px] cursor-pointer bg-white"
            value={sortFilter}
            onChange={(e) => updateSearchParams('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {products.length === 0 && (
        <div className="premium-card rounded-[2rem] p-10 text-center">
          <p className="font-display text-3xl font-extrabold text-ink-900">No matching products</p>
          <p className="mx-auto mt-3 max-w-md text-ink-500">
            Try a different category or clear your filters.
          </p>
          <Link to="/products" className="btn-secondary mt-6" onClick={() => window.location.href = '/products'}>
            Clear filters
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const isLastElement = products.length === index + 1;

          return (
            <article
              ref={isLastElement ? lastProductElementRef : null}
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
          );
        })}
      </div>

      {loadingMore && (
        <div className="mt-8 flex justify-center pb-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-sky-600"></div>
        </div>
      )}
    </div>
  );
}
