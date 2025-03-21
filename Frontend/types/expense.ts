export interface Expense {
  id: number;
  title: string;
  description: string;
  category: string;
  amount: string;
  date: string;
  destinationAddress: string;
  isAccepted?: boolean;
  isRejected?: boolean;
  transactionHash?: string;
} 