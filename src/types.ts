
export interface PurchaseOrder {
  id: string;
  vendor: string;
  date: string;
  amount: string;
  status: string;
  items: number;
  progress: {
    id: string;
    label: string;
    status: string;
    date?: string;
  }[];
  itemsList: {
    name: string;
    quantity: number;
    price: string;
  }[];
  notes: string;
  created_by?: string;
}

export interface PurchaseAdvice {
  id: string;
  department: string;
  requester: string;
  date: string;
  priority: string;
  status: string;
  description: string;
  justification?: string;
  progress: {
    id: string;
    label: string;
    status: string;
    date?: string;
  }[];
  created_by?: string;
}
