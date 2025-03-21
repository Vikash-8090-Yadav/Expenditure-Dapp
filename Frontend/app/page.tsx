"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { Wallet, DollarSign, PlusCircle, List, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddExpenseForm from "@/components/add-expense-form";
import ExpenseList from "@/components/expense-list";
import YourExpenses from "@/components/your-expenses";
import { Expense } from "@/types/expense";

// interface ExpenseListProps {
//   expenses: Expense[];
//   setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
//   onApproveExpense: (id: number) => Promise<void>;
//   onDeclineExpense: (id: number) => void;
// }

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [activeTab, setActiveTab] = useState("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      title: "Groceries",
      description: "Weekly grocery shopping",
      category: "Food",
      amount: "0.05",
      date: "2023-06-15",
      destinationAddress: "0x45B95a5549111e013E6b9a8D45951362A9f0793f",
    },
    {
      id: 2,
      title: "Rent",
      description: "Monthly apartment rent",
      category: "Housing",
      amount: "0.5",
      date: "2023-06-01",
      destinationAddress: "0x45B95a5549111e013E6b9a8D45951362A9f0793f",
    },
    {
      id: 3,
      title: "Internet Bill",
      description: "Monthly internet subscription",
      category: "Utilities",
      amount: "0.03",
      date: "2023-06-10",
      destinationAddress: "0x45B95a5549111e013E6b9a8D45951362A9f0793f",
    },
  ]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance).substring(0, 6));
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet");
    }
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      id: expenses.length + 1,
      ...expense,
      date: new Date().toISOString().split("T")[0],
    };
    setExpenses([...expenses, newExpense]);
    setActiveTab("expenses");
  };

  const handleApproveExpense = async (id: number) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    const expense = expenses.find((exp) => exp.id === id);
    if (!expense || !expense.destinationAddress) {
      alert("Invalid expense or missing destination address");
      return;
    }

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = await signer.sendTransaction({
        to: expense.destinationAddress,
        value: ethers.utils.parseEther(expense.amount),
      });

      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error approving expense:", error);
      alert("Failed to approve expense. See console for details.");
    }
  };

  const handleDeclineExpense = (id: number) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    const expenseIndex = expenses.findIndex((exp) => exp.id === id);
    if (expenseIndex === -1) {
      alert("Expense not found");
      return;
    }

    const updatedExpenses = [...expenses];
    updatedExpenses.splice(expenseIndex, 1);
    setExpenses(updatedExpenses);

    alert("Expense declined and removed from the list");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">ExpenseTracker DApp</h1>
          </div>

          {!account ? (
            <Button onClick={connectWallet} className="flex items-center gap-2 bg-primary text-primary-foreground">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="wallet-badge px-3 py-1 rounded-md text-sm">
                <span className="font-medium">{balance} CFX</span>
              </div>
              <div className="wallet-badge px-3 py-1 rounded-md text-sm">
                <span className="font-medium">
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-muted/30 p-4">
          <nav className="space-y-2">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Dashboard</h2>
            <Button
              variant={activeTab === "expenses" ? "default" : "ghost"}
              className={`w-full justify-start sidebar-nav-button ${
                activeTab === "expenses" ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
              onClick={() => setActiveTab("expenses")}
            >
              <List className="mr-2 h-4 w-4" />
              Expenses
            </Button>
            <Button
              variant={activeTab === "add-expense" ? "default" : "ghost"}
              className={`w-full justify-start sidebar-nav-button ${
                activeTab === "add-expense" ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
              onClick={() => setActiveTab("add-expense")}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
            <Button
              variant={activeTab === "your-expenses" ? "default" : "ghost"}
              className={`w-full justify-start sidebar-nav-button ${
                activeTab === "your-expenses" ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
              onClick={() => setActiveTab("your-expenses")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Your Expenses
            </Button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-background">
          {activeTab === "expenses" && (
            <ExpenseList
              expenses={expenses}
              setExpenses={setExpenses}
              onApproveExpense={handleApproveExpense}
              onDeclineExpense={handleDeclineExpense}
            />
          )}

          {activeTab === "add-expense" && <AddExpenseForm onAddExpense={addExpense} />}

          {activeTab === "your-expenses" && <YourExpenses expenses={expenses} />}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">ExpenseTracker DApp</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ExpenseTracker DApp. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}