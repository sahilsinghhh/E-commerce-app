import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerUser } from '../api/authApi';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
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
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: { status: 'register' } }));
        setSuccessMessage('Account created. Redirecting...');
        setTimeout(() => navigate('/'), 1200);
      } else {
        setErrors({ submit: response.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap grid min-h-[calc(100vh-5rem)] items-center py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <section className="hidden lg:block">
        <span className="eyebrow">New account</span>
        <h1 className="mt-5 font-display text-6xl font-extrabold leading-tight text-ink-900">
          Join a smoother way to shop.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
          Create a profile for faster checkout, saved carts, protected order history,
          and a cleaner purchasing workflow.
        </p>
      </section>

      <section className="premium-card mx-auto w-full max-w-xl rounded-[2rem] p-6 sm:p-8">
        <span className="eyebrow lg:hidden">New account</span>
        <h2 className="mt-4 font-display text-4xl font-extrabold text-ink-900">Create account</h2>
        <p className="mt-2 text-sm font-semibold text-ink-500">Start with a secure profile.</p>

        <div className="mt-6 space-y-3">
          {successMessage && <div className="status-success">{successMessage}</div>}
          {errors.submit && <div className="status-error">{errors.submit}</div>}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          {[
            ['name', 'Full name', 'text', 'Ada Lovelace'],
            ['email', 'Email address', 'email', 'you@company.com'],
            ['password', 'Password', 'password', 'Minimum 6 characters'],
            ['confirmPassword', 'Confirm password', 'password', 'Confirm password'],
          ].map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label className="field-label" htmlFor={name}>{label}</label>
              <input
                className={`input-field ${errors[name] ? 'border-red-300 ring-4 ring-red-100' : ''}`}
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
              />
              {errors[name] && <p className="mt-2 text-sm font-semibold text-red-600">{errors[name]}</p>}
            </div>
          ))}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-semibold text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-700 hover:text-sky-900">Login</Link>
        </p>
      </section>
    </main>
  );
}
