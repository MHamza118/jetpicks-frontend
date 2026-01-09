import { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  storeLink: string;
  weight: string;
  price: string;
  quantity: string;
  notes: string;
  images: File[];
}

export interface OrderData {
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  specialNotes: string;
  items: OrderItem[];
  reward: string;
  orderId?: string;
  selectedPickerId?: string;
}

interface OrderContextType {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  resetOrderData: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const initialOrderData: OrderData = {
  originCountry: '',
  originCity: '',
  destinationCountry: '',
  destinationCity: '',
  specialNotes: '',
  items: [],
  reward: '',
  selectedPickerId: undefined,
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData(prev => ({ ...prev, ...data }));
  };

  const resetOrderData = () => {
    setOrderData(initialOrderData);
  };

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData, resetOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};
