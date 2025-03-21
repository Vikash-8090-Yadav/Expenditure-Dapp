"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ethers } from "ethers";
import { marketplaceAddress } from "../config";
import abi from "../Abi/ExpenseManagement.json";
import { Expense } from "../types/expense";

interface YourExpensesProps {
  expenses: Expense[];
}

export default function YourExpenses({ expenses }: YourExpensesProps) {
  const [expensesState, setExpenses] = useState<Expense[]>(expenses);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!window.ethereum) {
        console.error("Please install MetaMask or another Ethereum wallet");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(marketplaceAddress, abi.abi, signer);

      try {
        const userAddress = await signer.getAddress();
        const expenseIds = await contract.getExpensesByCreator(userAddress);
        const expensesData = await Promise.all(
          expenseIds.map(async (id: number) => {
            const expense = await contract.getExpense(id);
            return {
              id: expense.id.toNumber(),
              title: expense.title,
              description: expense.description,
              category: expense.category,
              amount: ethers.utils.formatEther(expense.amount),
              date: new Date().toISOString().split("T")[0], // Assuming you want the current date
              destinationAddress: expense.destinationAddress,
            };
          })
        );
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  // Function to get category color
  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Housing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Transportation: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Utilities: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Healthcare: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Personal: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Education: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    };

    return categories[category] || categories["Other"];
  };

  // Calculate total expenses
  const totalExpenses = expensesState.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Expenses</h2>
        <Card className="w-auto">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} CFX</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>A list of your recent expenses and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (CFX)</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {expensesState.length > 0 ? (
                expensesState.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div>{expense.title}</div>
                      <div className="text-sm text-muted-foreground">{expense.description}</div>
                      {expense.destinationAddress && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          To: {expense.destinationAddress}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell className="text-right font-medium">{expense.amount}</TableCell>
                    
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No expenses found. Add your first expense to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

