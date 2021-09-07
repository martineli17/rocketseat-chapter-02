import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { GetProduct, GetStockProduct } from '../services/productService';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(GetCartLocalStorage());

  function SetCartLocalStorage(products: Product[]) {
    setCart(products);
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(products));
  }

  function GetCartLocalStorage(): Product[] {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart)
      return JSON.parse(storagedCart);

    return [];
  }

  const addProduct = async (productId: number) => {
    try {
      const stock = await GetStockProduct(productId);
      const productCart = cart.find(x => x.id == productId) ?? { ...await GetProduct(productId), amount: 0 };
      const amount = productCart.amount + 1;
      if (stock < 1 || stock < amount)
        toast.error('Quantidade solicitada fora de estoque');
      else {
        productCart.amount = amount;
        const currentCart = [...cart.filter(x => x.id !== productId), productCart];
        SetCartLocalStorage(currentCart);
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (!cart.find(c => c.id == productId))
        toast.error('Erro na remoção do produto');
      else {
        const currentCart = cart.filter(c => c.id !== productId);
        SetCartLocalStorage(currentCart);
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async (product: UpdateProductAmount) => {
    try {
      const productCart = cart.find(x => x.id == product.productId);
      if (product.amount < 1) return;

      const stock = await GetStockProduct(productCart?.id || 0);

      if (!productCart || stock < product.amount)
        toast.error('Quantidade solicitada fora de estoque');
      else {
        const currentCart = [...cart.filter(x => x.id !== productCart.id), { ...productCart, amount: product.amount }];
        setCart(currentCart);
        SetCartLocalStorage(currentCart);
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}



export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}