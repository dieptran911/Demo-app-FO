
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
}
