import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setSuccessMessage(response.message || 'If a user with this email exists, a password reset link has been sent.');
        setEmail('');
      } else {
        setError(response.message || 'Failed to request password reset');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap grid min-h-[calc(100vh-5rem)] items-center py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <section className="hidden lg:block">
        <span className="eyebrow">Recovery Center</span>
        <h1 className="mt-5 font-display text-6xl font-extrabold leading-tight text-ink-900">
          Retrieve your account credentials.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
          Enter your registered email address, and we will send you secure instructions to reset your password and restore account access.
        </p>
      </section>

      <section className="premium-card mx-auto w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <div>
          <span className="eyebrow lg:hidden">Recovery Center</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Forgot Password</h2>
          <p className="mt-2 text-sm font-semibold text-ink-500">No worries! It happens. Enter your email below.</p>
        </div>

        <div className="mt-6 space-y-3">
          {successMessage && <div className="status-success">{successMessage}</div>}
          {error && <div className="status-error">{error}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <div>
            <label className="field-label" htmlFor="email">Email address</label>
            <input
              className={`input-field ${error ? 'border-red-300 ring-4 ring-red-100' : ''}`}
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending Link...' : 'Send Reset Link'}
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
