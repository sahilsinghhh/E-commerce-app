import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/priceUtils';

export default function CartPage() {
  const { cartItems, cartLoading, cartError, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { showToast } = useToast();
  const shipping = cartTotal > 4000 ? 0 : 200;

  const handleQuantityChange = async (item, quantity) => {
    try {
      await updateQuantity(item._id, quantity);
    } catch (error) {
      showToast({
        title: 'Could not update cart',
        message: error.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeFromCart(item._id);
      showToast({
        title: 'Removed from cart',
        message: `${item.name} was removed.`,
      });
    } catch (error) {
      showToast({
        title: 'Could not remove item',
        message: error.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  if (cartLoading) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
          <span className="eyebrow">Cart</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-ink-900">
            Loading your cart
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-500">
            Pulling your saved items from your account.
          </p>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card mx-auto max-w-2xl rounded-[2rem] p-10 text-center">
          <span className="eyebrow">Cart</span>
          {cartError && <div className="status-error mb-5 text-left">{cartError}</div>}
          <h1 className="mt-5 font-display text-4xl font-extrabold text-ink-900">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-md text-ink-500">
            Build a cart from the curated collection and checkout in a few clean steps.
          </p>
          <Link to="/" className="btn-primary mt-8">
            Start shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Checkout queue</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Shopping cart</h1>
        </div>
        <Link to="/" className="btn-secondary">
          Continue shopping
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <section className="grid gap-4">
          {cartItems.map((item) => (
            <article key={item._id} className="premium-card rounded-[1.75rem] p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="aspect-square w-full rounded-3xl object-cover sm:w-32"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">
                    {item.category}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-extrabold text-ink-900">{item.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-ink-500">{formatPrice(item.price)} each</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full border border-ink-200 bg-white p-1">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="grid h-9 w-9 place-items-center rounded-full font-bold hover:bg-ink-50"
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="grid h-9 w-9 place-items-center rounded-full font-bold hover:bg-ink-50"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      className="rounded-full px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-display text-2xl font-extrabold text-ink-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </article>
          ))}
        </section>

        <aside className="premium-card h-fit rounded-[1.75rem] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Order summary</h2>
          <div className="mt-6 space-y-4 text-sm font-semibold">
            <div className="flex justify-between text-ink-500">
              <span>Subtotal</span>
              <span className="text-ink-900">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-ink-500">
              <span>Shipping</span>
              <span className="text-ink-900">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="border-t border-ink-100 pt-4">
              <div className="flex justify-between text-base text-ink-900">
                <span>Total</span>
                <span>{formatPrice(cartTotal + shipping)}</span>
              </div>
            </div>
          </div>
          <Link to="/checkout" className="btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
          <p className="mt-4 text-center text-xs font-semibold text-ink-500">
            Encrypted checkout and protected order history.
          </p>
        </aside>
      </div>
    </main>
  );
}
