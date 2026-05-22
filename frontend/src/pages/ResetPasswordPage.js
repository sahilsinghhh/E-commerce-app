import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../api/authApi';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, formData.password);
      if (response.success) {
        setSuccessMessage('Password reset successfully. Redirecting to login...');
        setFormData({ password: '', confirmPassword: '' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErrors({ submit: response.message || 'Failed to reset password' });
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Invalid or expired password reset token' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap grid min-h-[calc(100vh-5rem)] items-center py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <section className="hidden lg:block">
        <span className="eyebrow">Recovery Center</span>
        <h1 className="mt-5 font-display text-6xl font-extrabold leading-tight text-ink-900">
          Secure your online identity.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
          Please enter your new strong password below to secure your credentials and re-establish secure access to your ShopHub account.
        </p>
      </section>

      <section className="premium-card mx-auto w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <div>
          <span className="eyebrow lg:hidden">Recovery Center</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Reset Password</h2>
          <p className="mt-2 text-sm font-semibold text-ink-500">Enter a secure, memorable new password.</p>
        </div>

        <div className="mt-6 space-y-3">
          {successMessage && <div className="status-success">{successMessage}</div>}
          {errors.submit && <div className="status-error">{errors.submit}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div>
            <label className="field-label" htmlFor="password">New Password</label>
            <input
              className={`input-field ${errors.password ? 'border-red-300 ring-4 ring-red-100' : ''}`}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              disabled={loading}
            />
            {errors.password && <p className="mt-2 text-sm font-semibold text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className={`input-field ${errors.confirmPassword ? 'border-red-300 ring-4 ring-red-100' : ''}`}
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              disabled={loading}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm font-semibold text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-500">
          Back to{' '}
          <Link to="/login" className="text-sky-700 hover:text-sky-900">Login</Link>
        </p>
      </section>
    </main>
  );
}
