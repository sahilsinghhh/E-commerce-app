import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as loginUser } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: { status: 'login' } }));
        setSuccessMessage('Login successful. Redirecting...');
        setTimeout(() => navigate(redirectTo), 800);
      } else {
        setErrors({ submit: response.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Invalid email or password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap grid min-h-[calc(100vh-5rem)] items-center py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <section className="hidden lg:block">
        <span className="eyebrow">Account access</span>
        <h1 className="mt-5 font-display text-6xl font-extrabold leading-tight text-ink-900">
          Your commerce workspace, secured.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
          Sign in to manage orders, saved carts, and admin controls from a polished
          interface designed for speed and confidence.
        </p>
      </section>

      <section className="premium-card mx-auto w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <div>
          <span className="eyebrow lg:hidden">Account access</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Welcome back</h2>
          <p className="mt-2 text-sm font-semibold text-ink-500">Login to continue shopping.</p>
        </div>

        <div className="mt-6 space-y-3">
          {successMessage && <div className="status-success">{successMessage}</div>}
          {errors.submit && <div className="status-error">{errors.submit}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              className={`input-field ${errors.email ? 'border-red-300 ring-4 ring-red-100' : ''}`}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
            />
            {errors.email && <p className="mt-2 text-sm font-semibold text-red-600">{errors.email}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-bold text-ink-700" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-sm font-bold text-sky-700 hover:text-sky-900">
                Forgot password?
              </Link>
            </div>
            <input
              className={`input-field ${errors.password ? 'border-red-300 ring-4 ring-red-100' : ''}`}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-2 text-sm font-semibold text-red-600">{errors.password}</p>}
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold text-ink-600">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-ink-300 text-sky-600"
            />
            Remember me on this device
          </label>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-500">
          Do not have an account?{' '}
          <Link to="/register" className="text-sky-700 hover:text-sky-900">Create one</Link>
        </p>
      </section>
    </main>
  );
}
