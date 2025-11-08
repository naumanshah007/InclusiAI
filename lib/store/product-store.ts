import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  variant?: string;
  size?: string;
  brand?: string;
  category?: string;
  timestamp: number;
  image?: string; // Base64 image
}

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'timestamp'>) => void;
  removeProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  clearHistory: () => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) =>
        set((state) => ({
          products: [
            {
              ...product,
              id: `product-${Date.now()}`,
              timestamp: Date.now(),
            },
            ...state.products,
          ],
        })),
      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      getProductByBarcode: (barcode) => {
        return get().products.find((p) => p.barcode === barcode);
      },
      searchProducts: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.brand?.toLowerCase().includes(lowerQuery) ||
            p.category?.toLowerCase().includes(lowerQuery) ||
            p.barcode.includes(query)
        );
      },
      clearHistory: () => set({ products: [] }),
    }),
    {
      name: 'inclusiaid-product-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

