import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, fetchProductById } from '../../api/productApi';
import ProductImageUploader from '../../components/ProductImageUploader';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id, isEditMode]);

  const loadProduct = async () => {
    try {
      const response = await fetchProductById(id);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (err) {
      setError('Failed to load product data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrap py-10 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <span className="eyebrow">{isEditMode ? 'Edit product' : 'New product'}</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-ink-900">
            {isEditMode ? 'Refine product details' : 'Create a catalog item'}
          </h1>
        </div>

        <section className="premium-card rounded-[2rem] p-6 sm:p-8">
          {error && <div className="status-error mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <label className="field-label" htmlFor="name">Product name</label>
              <input
                id="name"
                className="input-field"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Wireless headphones"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="input-field min-h-32"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="price">Price</label>
                <input
                  id="price"
                  className="input-field"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  className="input-field"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="category">Category</label>
              <select
                id="category"
                className="input-field"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home</option>
                <option value="Beauty">Beauty</option>
              </select>
            </div>

            <div>
              <label className="field-label">Product images</label>
              <ProductImageUploader
                images={formData.images || []}
                productName={formData.name}
                onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              />
            </div>

            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save product'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
