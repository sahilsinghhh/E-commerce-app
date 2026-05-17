import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addAddress,
  deleteAddress,
  getProfile,
  setDefaultAddress,
  updateAddress,
  updateProfile,
} from '../api/authApi';
import { useToast } from '../context/ToastContext';

const emptyAddress = {
  label: 'Home',
  fullName: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  isDefault: false,
};

export default function AccountPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [profileName, setProfileName] = useState(profile?.name || '');
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [loading, setLoading] = useState(!profile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState(null);

  const syncProfile = (user) => {
    setProfile(user);
    setProfileName(user?.name || '');
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: { status: 'profile' } }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        if (response.success) syncProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      const response = await updateProfile({ name: profileName });
      if (response.success) {
        syncProfile(response.data);
        showToast({ title: 'Profile updated', message: 'Your account details were saved.' });
      }
    } catch (err) {
      showToast({
        title: 'Could not update profile',
        message: err.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    try {
      setSavingAddress(true);
      const response = editingAddressId
        ? await updateAddress(editingAddressId, addressForm)
        : await addAddress(addressForm);

      if (response.success) {
        syncProfile(response.data);
        setAddressForm(emptyAddress);
        setEditingAddressId(null);
        showToast({
          title: editingAddressId ? 'Address updated' : 'Address saved',
          message: 'Your delivery address is ready for checkout.',
        });
      }
    } catch (err) {
      showToast({
        title: 'Could not save address',
        message: err.response?.data?.message || 'Please check the form and try again.',
        type: 'error',
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || 'Home',
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await deleteAddress(addressId);
      if (response.success) {
        syncProfile(response.data);
        showToast({ title: 'Address deleted', message: 'The saved address was removed.' });
      }
    } catch (err) {
      showToast({
        title: 'Could not delete address',
        message: err.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  const handleDefaultAddress = async (addressId) => {
    try {
      const response = await setDefaultAddress(addressId);
      if (response.success) {
        syncProfile(response.data);
        showToast({ title: 'Default address set', message: 'Checkout will preselect this address.' });
      }
    } catch (err) {
      showToast({
        title: 'Could not update default',
        message: err.response?.data?.message || 'Please try again.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <main className="page-wrap py-16">
        <div className="premium-card rounded-[2rem] p-8">
          <div className="h-5 w-36 animate-pulse rounded bg-ink-100" />
          <div className="mt-5 h-10 w-72 max-w-full animate-pulse rounded bg-ink-100" />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-3xl bg-ink-100" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mb-8">
        <span className="eyebrow">Account</span>
        <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">
          {profile?.name || 'Your account'}
        </h1>
        <p className="mt-2 text-ink-500">Manage your profile, saved addresses, cart, and order history.</p>
      </div>

      {error && <div className="status-error mb-6">{error}</div>}

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid gap-6">
          <form onSubmit={handleProfileSubmit} className="premium-card rounded-[2rem] p-6">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Profile</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="field-label" htmlFor="profileName">Name</label>
                <input
                  id="profileName"
                  className="input-field"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  required
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Email</p>
                <p className="mt-1 font-semibold text-ink-900">{profile?.email || 'Not available'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Role</p>
                <p className="mt-1 font-semibold capitalize text-ink-900">{profile?.role || 'customer'}</p>
              </div>
            </div>
            <button className="btn-primary mt-6 w-full" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/orders" className="premium-card rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Orders</p>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Order history</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">View recent purchases and confirmation details.</p>
            </Link>
            <Link to="/cart" className="premium-card rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-glow">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">Cart</p>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-ink-900">Saved cart</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">Return to your user-specific checkout flow.</p>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          <form onSubmit={handleAddressSubmit} className="premium-card rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-extrabold text-ink-900">
                {editingAddressId ? 'Edit address' : 'Save address'}
              </h2>
              {editingAddressId && (
                <button
                  type="button"
                  className="rounded-full px-3 py-2 text-sm font-bold text-ink-500 hover:bg-ink-50"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm(emptyAddress);
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['label', 'Label', 'Home'],
                ['fullName', 'Recipient name', 'Ada Lovelace'],
                ['phone', 'Phone', '+1 555 0100'],
                ['city', 'City', 'San Francisco'],
                ['postalCode', 'Postal code', '94103'],
                ['country', 'Country', 'United States'],
              ].map(([name, label, placeholder]) => (
                <div key={name}>
                  <label className="field-label" htmlFor={name}>{label}</label>
                  <input
                    id={name}
                    name={name}
                    className="input-field"
                    value={addressForm[name]}
                    onChange={handleAddressChange}
                    placeholder={placeholder}
                    required={name !== 'label'}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="address">Street address</label>
                <input
                  id="address"
                  name="address"
                  className="input-field"
                  value={addressForm.address}
                  onChange={handleAddressChange}
                  placeholder="123 Market Street"
                  required
                />
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-ink-600 sm:col-span-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={addressForm.isDefault}
                  onChange={handleAddressChange}
                  className="h-4 w-4 rounded border-ink-300"
                />
                Use as default delivery address
              </label>
            </div>

            <button className="btn-primary mt-6 w-full" disabled={savingAddress}>
              {savingAddress ? 'Saving...' : editingAddressId ? 'Update address' : 'Save address'}
            </button>
          </form>

          <section className="premium-card rounded-[2rem] p-6">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">Saved addresses</h2>
            {profile?.addresses?.length ? (
              <div className="mt-5 grid gap-3">
                {profile.addresses.map((address) => (
                  <article key={address._id} className="rounded-3xl border border-ink-100 bg-white/70 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-ink-900">{address.label || 'Address'}</h3>
                          {address.isDefault && (
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-ink-600">{address.fullName} · {address.phone}</p>
                        <p className="mt-1 text-sm leading-6 text-ink-500">
                          {address.address}, {address.city}, {address.postalCode}, {address.country}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!address.isDefault && (
                          <button type="button" onClick={() => handleDefaultAddress(address._id)} className="btn-secondary px-3 py-2">
                            Select
                          </button>
                        )}
                        <button type="button" onClick={() => handleEditAddress(address)} className="btn-secondary px-3 py-2">
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address._id)}
                          className="rounded-full bg-red-50 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-ink-200 p-6 text-center">
                <p className="font-bold text-ink-900">No saved addresses yet</p>
                <p className="mt-2 text-sm text-ink-500">Save one here and checkout can reuse it instantly.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
