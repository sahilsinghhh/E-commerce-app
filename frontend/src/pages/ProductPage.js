import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductGallery from '../components/ProductGallery';
import { formatPrice } from '../utils/priceUtils';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetchProductById(id);
        if (response.success) {
          setProduct(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      showToast({
        title: 'Added to cart',
        message: `${quantity} x ${product.name} added.`,
      });
    } catch (error) {
      showToast({
        title: 'Could not add item',
        message: error.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="page-wrap py-16">
        <div className="premium-card rounded-[2rem] p-10 text-center font-bold text-ink-500">
          Loading product...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrap py-16">
        <div className="status-error">Product not found</div>
      </div>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6">
        Back to products
      </button>

      <section className="grid gap-8 lg:grid-cols-[1fr_0.88fr]">
        <ProductGallery product={product} />

        <div className="premium-card rounded-[2rem] p-6 sm:p-8">
          <span className="eyebrow">{product.category}</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-ink-900 sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="font-display text-4xl font-extrabold text-ink-900">
              {formatPrice(product.price)}
            </p>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <p className="mt-6 text-base leading-8 text-ink-500">{product.description}</p>

          <div className="mt-8 rounded-3xl border border-ink-100 bg-white/70 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex w-full items-center justify-between rounded-full border border-ink-200 bg-white p-1 sm:w-36">
                <button
                  className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold hover:bg-ink-50"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  type="button"
                >
                  -
                </button>
                <span className="font-bold text-ink-900">{quantity}</span>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold hover:bg-ink-50"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  type="button"
                >
                  +
                </button>
              </div>

              <button
                className="btn-primary flex-1"
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                type="button"
              >
                Add to cart
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Priority delivery', 'Free shipping on orders over ₹4,000'],
              ['Protected purchase', 'Two-year coverage included'],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-ink-100 bg-white/70 p-4">
                <p className="font-bold text-ink-900">{title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-500">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
