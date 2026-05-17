import React from 'react';
import ReactDOM from 'react-dom/client';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ToastProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </ToastProvider>
);
