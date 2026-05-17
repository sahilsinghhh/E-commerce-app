import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { useCart } from '../../context/CartContext';

const navItems = [
  { label: 'Store', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Cart', to: '/cart' },
];

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    const syncAuthState = () => {
      setToken(localStorage.getItem('accessToken'));
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    };

    window.addEventListener('auth:changed', syncAuthState);
    return () => window.removeEventListener('auth:changed', syncAuthState);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/products?search=${encodeURIComponent(trimmedQuery)}` : '/products');
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:changed', { detail: { status: 'logout' } }));
      setMenuOpen(false);
      navigate('/login');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-2xl">
      <div className="page-wrap">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink-900 text-sm font-black text-white shadow-glow transition group-hover:-rotate-3">
              S
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold leading-none text-ink-900">
                ShopHub
              </span>
              <span className="text-xs font-semibold text-ink-500">Curated commerce OS</span>
            </span>
          </Link>

          <nav className="hidden items-center rounded-full border border-ink-200/80 bg-white/70 p-1 shadow-sm lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-ink-900 text-white shadow-sm'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            <form className="relative max-w-xs flex-1" onSubmit={handleSearch}>
              <label className="sr-only" htmlFor="site-search">Search products</label>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-ink-400">
                /
              </span>
              <input
                id="site-search"
                className="input-field rounded-full py-2.5 pl-9"
                placeholder="Search catalog"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </form>

            <Link to="/cart" className="btn-secondary relative px-4 py-2.5">
              Cart
              {cartCount > 0 && (
                <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="btn-secondary px-4 py-2.5">
                    Dashboard
                  </Link>
                )}
                <Link to="/account" className="btn-secondary px-4 py-2.5">
                  Account
                </Link>
                <button onClick={handleLogout} className="btn-primary px-4 py-2.5">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary px-4 py-2.5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2.5">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-ink-200 bg-white text-ink-900 shadow-sm lg:hidden"
          >
            <span className="flex flex-col gap-1.5">
              <span className={`h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`h-0.5 w-5 rounded bg-current transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-5 rounded bg-current transition ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </span>
          </button>
        </div>

        {menuOpen && (
          <div className="pb-4 lg:hidden">
            <div className="premium-card rounded-3xl p-3">
              <div className="grid gap-2">
                <form onSubmit={handleSearch} className="px-1 pb-2">
                  <label className="sr-only" htmlFor="mobile-site-search">Search products</label>
                  <input
                    id="mobile-site-search"
                    className="input-field rounded-2xl"
                    placeholder="Search catalog"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </form>
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50"
                  >
                    {item.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50"
                  >
                    Dashboard
                  </Link>
                )}
                {token && (
                  <Link
                    to="/account"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold text-ink-700 hover:bg-ink-50"
                  >
                    Account
                  </Link>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-ink-100 pt-3">
                {token ? (
                  <button onClick={handleLogout} className="btn-primary col-span-2">
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary">
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
