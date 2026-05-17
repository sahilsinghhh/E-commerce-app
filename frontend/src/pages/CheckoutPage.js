import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { getProfile } from '../api/authApi';
import { formatPrice } from '../utils/priceUtils';
import PaymentOverlay from '../components/PaymentOverlay';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const shippingPrice = cartTotal > 4000 ? 0 : 200;

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressesLoading(true);
        const response = await getProfile();
        if (response.success) {
          const addresses = response.data.addresses || [];
          setSavedAddresses(addresses);
          const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id);
            setShippingAddress({
              address: defaultAddress.address,
              city: defaultAddress.city,
              postalCode: defaultAddress.postalCode,
              country: defaultAddress.country,
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load saved addresses');
      } finally {
        setAddressesLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAddressId('custom');
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = savedAddresses.find((address) => address._id === addressId);
    if (!selectedAddress) return;

    setShippingAddress({
      address: selectedAddress.address,
      city: selectedAddress.city,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const totalPrice = cartTotal + shippingPrice;
    const orderData = {
      orderItems: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        image: item.image,
        price: item.price,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod: 'Credit Card',
      itemsPrice: cartTotal,
      shippingPrice,
      totalPrice,
    };

    try {
      const response = await createOrder(orderData);
      if (response.success) {
        setCreatedOrder(response.data);
        setShowPaymentModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8">
        <span className="eyebrow">Secure checkout</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Delivery details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <section className="premium-card rounded-[2rem] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="grid gap-5">
            {error && <div className="status-error">{error}</div>}

            {addressesLoading ? (
              <div className="rounded-3xl border border-ink-100 bg-white/70 p-4">
                <div className="h-5 w-40 animate-pulse rounded bg-ink-100" />
                <div className="mt-3 h-16 animate-pulse rounded-2xl bg-ink-100" />
              </div>
            ) : savedAddresses.length > 0 ? (
              <div>
                <label className="field-label" htmlFor="savedAddress">Saved address</label>
                <select
                  id="savedAddress"
                  className="input-field"
                  value={selectedAddressId}
                  onChange={(event) => handleSelectAddress(event.target.value)}
                >
                  {savedAddresses.map((address) => (
                    <option key={address._id} value={address._id}>
                      {address.label || 'Address'} - {address.address}, {address.city}
                    </option>
                  ))}
                  <option value="custom">Use a different address</option>
                </select>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 p-4">
                <p className="font-bold text-ink-900">No saved addresses</p>
                <p className="mt-1 text-sm text-ink-500">Enter one below, or save addresses from your account page.</p>
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="address">Street address</label>
              <input
                id="address"
                className="input-field"
                name="address"
                value={shippingAddress.address}
                onChange={handleChange}
                required
                placeholder="123 Market Street"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="city">City</label>
                <input
                  id="city"
                  className="input-field"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="postalCode">Postal code</label>
                <input
                  id="postalCode"
                  className="input-field"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="country">Country</label>
              <input
                id="country"
                className="input-field"
                name="country"
                value={shippingAddress.country}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary mt-2" disabled={loading}>
              {loading ? 'Processing order...' : 'Place order'}
            </button>
          </form>
        </section>

        <aside className="premium-card h-fit rounded-[1.75rem] p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Your order</h2>
          <div className="mt-5 divide-y divide-ink-100">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between gap-4 py-3 text-sm">
                <span className="font-semibold text-ink-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-bold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-3xl bg-ink-900 p-5 text-white">
            <p className="text-sm font-semibold text-sky-100">Total to pay</p>
            <p className="mt-1 font-display text-3xl font-extrabold">
              {formatPrice(cartTotal + shippingPrice)}
            </p>
          </div>
        </aside>
      </div>

      {showPaymentModal && createdOrder && (
        <PaymentOverlay
          order={createdOrder}
          onClose={() => {
            setShowPaymentModal(false);
            clearCart();
            navigate('/orders');
          }}
          onSuccess={(paidOrder) => {
            setShowPaymentModal(false);
            clearCart();
            navigate(`/orders/${paidOrder._id}`);
          }}
        />
      )}
    </main>
  );
}
