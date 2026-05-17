import ProductList from '../components/ProductList';

const categories = [
  { name: 'Devices', count: '200+', accent: 'from-sky-100 to-white' },
  { name: 'Style', count: '500+', accent: 'from-rose-100 to-white' },
  { name: 'Home', count: '350+', accent: 'from-emerald-100 to-white' },
  { name: 'Performance', count: '180+', accent: 'from-amber-100 to-white' },
];

const metrics = [
  ['99.9%', 'checkout uptime'],
  ['2.1M', 'orders shipped'],
  ['4.9/5', 'buyer confidence'],
];

export default function HomePage() {
  return (
    <main>
      <section className="page-wrap grid gap-10 pb-12 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-14">
        <div className="animate-fade-up">
          <span className="eyebrow">Premium marketplace</span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[1.02] text-ink-900 sm:text-6xl lg:text-7xl">
            Commerce that feels precise, fast, and quietly luxurious.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-500">
            Discover curated products with transparent pricing, resilient checkout, and
            a buying experience tuned for modern teams and discerning customers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#featured" className="btn-primary">
              Explore collection
            </a>
            <a href="#categories" className="btn-secondary">
              Browse categories
            </a>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {metrics.map(([value, label]) => (
              <div key={label} className="premium-card rounded-2xl p-4">
                <p className="font-display text-2xl font-extrabold text-ink-900">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up lg:justify-self-end" style={{ animationDelay: '120ms' }}>
          <div className="premium-card overflow-hidden rounded-[2rem]">
            <div className="border-b border-white/70 bg-ink-900 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-200">
                    Live demand
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-extrabold">Launch dashboard</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                  Active
                </span>
              </div>
            </div>
            <div className="grid gap-4 p-5">
              {['Wireless audio', 'Everyday carry', 'Workspace upgrades'].map((item, index) => (
                <div key={item} className="rounded-3xl border border-ink-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-ink-900">{item}</p>
                      <p className="mt-1 text-sm text-ink-500">Conversion velocity +{18 + index * 7}%</p>
                    </div>
                    <div className="h-12 w-24 overflow-hidden rounded-2xl bg-gradient-to-r from-sky-100 via-white to-emerald-100">
                      <div className="h-full w-16 animate-shimmer bg-white/70" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="border-y border-white/70 bg-white/45 py-10">
        <div className="page-wrap">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="eyebrow">Catalog intelligence</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-ink-900">
                Shop by high-signal collections
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink-500">
              Each category is structured for fast scanning, confident comparison, and
              a clear path from discovery to checkout.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className={`rounded-3xl border border-white/80 bg-gradient-to-br ${category.accent} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-premium`}
              >
                <div className="mb-8 h-12 w-12 rounded-2xl bg-ink-900 shadow-glow" />
                <h3 className="font-display text-xl font-extrabold text-ink-900">{category.name}</h3>
                <p className="mt-1 text-sm font-semibold text-ink-500">{category.count} products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="page-wrap py-14">
        <ProductList />
      </section>
    </main>
  );
}
