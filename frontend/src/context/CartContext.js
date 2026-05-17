import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCartItem,
  clearServerCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '../api/cartApi';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const isAuthenticated = () => Boolean(localStorage.getItem('accessToken'));

const normalizeServerCart = (cart) =>
  (cart?.items || [])
    .filter((item) => item.product)
    .map((item) => ({
      ...item.product,
      _id: item.product._id,
      quantity: item.quantity,
    }));

const getLocalCart = () => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getLocalCart);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const loadServerCart = useCallback(async () => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      setCartLoading(true);
      setCartError(null);
      const response = await fetchCart();
      if (response.success) {
        setCartItems(normalizeServerCart(response.data));
      }
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to load cart');
    } finally {
      setCartLoading(false);
    }
  }, []);

  const mergeGuestCart = useCallback(async (guestItems) => {
    const itemsToMerge = guestItems.filter((item) => item?._id && item.quantity > 0);

    for (const item of itemsToMerge) {
      await addCartItem({ productId: item._id, quantity: item.quantity });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    loadServerCart();
  }, [loadServerCart]);

  useEffect(() => {
    const handleAuthChange = async (event) => {
      if (event.detail?.status === 'logout') {
        setCartItems([]);
        return;
      }

      if (event.detail?.status === 'login' || event.detail?.status === 'register') {
        const guestItems = getLocalCart();
        if (guestItems.length > 0) {
          try {
            setCartLoading(true);
            await mergeGuestCart(guestItems);
            localStorage.removeItem('cart');
          } catch (error) {
            setCartError(error.response?.data?.message || 'Failed to merge guest cart');
          } finally {
            setCartLoading(false);
          }
        }
      }

      loadServerCart();
    };

    window.addEventListener('auth:changed', handleAuthChange);
    return () => window.removeEventListener('auth:changed', handleAuthChange);
  }, [loadServerCart, mergeGuestCart]);

  const updateLocalCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
  };

  const addToCart = async (product, quantity = 1) => {
    setCartError(null);

    if (!isAuthenticated()) {
      updateLocalCart(product, quantity);
      return;
    }

    try {
      const response = await addCartItem({ productId: product._id, quantity });
      if (response.success) {
        setCartItems(normalizeServerCart(response.data));
      }
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to add item to cart');
      throw error;
    }
  };

  const removeFromCart = async (id) => {
    setCartError(null);

    if (!isAuthenticated()) {
      setCartItems((prevItems) => prevItems.filter((item) => item._id !== id));
      return;
    }

    try {
      const response = await removeCartItem(id);
      if (response.success) {
        setCartItems(normalizeServerCart(response.data));
      }
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to remove item from cart');
      throw error;
    }
  };

  const updateQuantity = async (id, quantity) => {
    const safeQuantity = Math.max(1, quantity);
    setCartError(null);

    if (!isAuthenticated()) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item._id === id ? { ...item, quantity: safeQuantity } : item
        )
      );
      return;
    }

    try {
      const response = await updateCartItem({ productId: id, quantity: safeQuantity });
      if (response.success) {
        setCartItems(normalizeServerCart(response.data));
      }
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to update cart item');
      throw error;
    }
  };

  const clearCart = async () => {
    setCartError(null);

    if (!isAuthenticated()) {
      setCartItems([]);
      return;
    }

    try {
      const response = await clearServerCart();
      if (response.success) {
        setCartItems([]);
      }
    } catch (error) {
      setCartError(error.response?.data?.message || 'Failed to clear cart');
      setCartItems([]);
    }
  };

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartError,
        refreshCart: loadServerCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
