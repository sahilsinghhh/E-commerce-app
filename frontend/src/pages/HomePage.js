import ProductList from '../components/ProductList';


export default function HomePage() {
  return (
    <main>
      <section id="featured" className="page-wrap py-14">
        <ProductList />
      </section>
    </main>
  );
}
