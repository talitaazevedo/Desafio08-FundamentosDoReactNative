import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const product = await AsyncStorage.getItem('@GoMarketplace:products');

      if (product) {
        setProducts([...JSON.parse(product)]);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function savingData(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    }
    savingData();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const productExists = products.findIndex(p => p.id === product.id);

      if (productExists !== -1) {
        setProducts(state =>
          state.map(p => {
            if (p.id === product.id) {
              return { ...p, quantity: p.quantity + 1 };
            }
            return p;
          }),
        );
        // await AsyncStorage.setItem(
        //   '@GoMarketplace:products',
        //   JSON.stringify(products),
        // );
      } else {
        const newProduct = { ...product, quantity: 1 };
        setProducts([...products, newProduct]);
        // await AsyncStorage.setItem(
        //   '@GoMarketplace:products',
        //   JSON.stringify(products),
        // );
      }
    },
    [products],
  );

  const increment = useCallback(async id => {
    setProducts(state =>
      state.map(p => {
        if (p.id === id) {
          return { ...p, quantity: p.quantity + 1 };
        }
        return p;
      }),
    );
    // await AsyncStorage.setItem(
    //   '@GoMarketplace:products',
    //   JSON.stringify(products),
    // );
  }, []);

  const decrement = useCallback(
    async id => {
      const productIndex = products.find(p => p.id === id);

      if (productIndex.quantity <= 1) {
        setProducts(state => state.filter(p => p.id !== id));
        // await AsyncStorage.setItem(
        //   '@GoMarketplace:products',
        //   JSON.stringify(products),
        // );
      } else {
        setProducts(state =>
          state.map(p => {
            if (p.id === id && p.quantity > 0) {
              return { ...p, quantity: p.quantity - 1 };
            }
            return p;
          }),
        );
        // await AsyncStorage.setItem(
        //   '@GoMarketplace:products',
        //   JSON.stringify(products),
        // );
      }
      // await AsyncStorage.setItem(
      //   '@GoMarketplace:products',
      //   JSON.stringify(products),
      // );
    },

    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
