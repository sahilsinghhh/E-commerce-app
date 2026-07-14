import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductForm from './pages/admin/ProductForm';
import AdminRoute from './components/auth/AdminRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Footer from './components/layout/Footer';

// Info Pages
import ReturnPolicyPage from './pages/info/ReturnPolicyPage';
import RefundPolicyPage from './pages/info/RefundPolicyPage';
import ShippingPolicyPage from './pages/info/ShippingPolicyPage';
import FaqPage from './pages/info/FaqPage';
import ProductGuidesPage from './pages/info/ProductGuidesPage';
import WarrantyPage from './pages/info/WarrantyPage';
import SizeGuidesPage from './pages/info/SizeGuidesPage';
import HelpCenterPage from './pages/info/HelpCenterPage';

import './styles/main.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:id"
            element={
              <ProtectedRoute>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

          {/* Info Pages Routes */}
          <Route path="/returns" element={<ReturnPolicyPage />} />
          <Route path="/refunds" element={<RefundPolicyPage />} />
          <Route path="/shipping" element={<ShippingPolicyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/product-guides" element={<ProductGuidesPage />} />
          <Route path="/warranty" element={<WarrantyPage />} />
          <Route path="/size-guides" element={<SizeGuidesPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
