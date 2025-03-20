"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ethers } from "ethers"
import { marketplaceAddress } from "../config"
import abi from "../Abi/ExpenseManagement.json"

interface Expense {
  id: number
  title: string
  description: string
  category: string
  amount: string
  date: string
  destinationAddress?: string
  isAccepted?: boolean
  isRejected?: boolean
  transactionHash?: string
}

interface ExpenseListProps {
  onApproveExpense?: (id: number) => void
  onDeclineExpense?: (id: number) => void
}

export default function ExpenseList({ onApproveExpense = () => {}, onDeclineExpense = () => {} }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [contractBalance, setContractBalance] = useState<string>("0")
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  const [loadingApprove, setLoadingApprove] = useState<Record<number, boolean>>({})
  const [loadingDecline, setLoadingDecline] = useState<Record<number, boolean>>({})

  const ownerAddress = "0x45B95a5549111e013E6b9a8D45951362A9f0793f"

  useEffect(() => {
    const fetchExpensesAndBalance = async () => {
      if (!window.ethereum) {
        console.error("Please install MetaMask or another Ethereum wallet")
        return
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(marketplaceAddress, abi.abi, signer)

      try {
        const userAddress = await signer.getAddress()
        setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase())

        // Fetch contract balance
        const balance = await provider.getBalance(marketplaceAddress)
        setContractBalance(ethers.utils.formatEther(balance))

        const totalExpenses = await contract.expenseCounter()
        const expensesData = await Promise.all(
          Array.from({ length: Number(totalExpenses) }, async (_, index) => {
            const expense = await contract.getExpense(index + 1)
            return {
              id: Number(expense.id),
              title: expense.title,
              description: expense.description,
              category: expense.category,
              amount: ethers.utils.formatEther(expense.amount),
              date: new Date().toISOString().split("T")[0], // Assuming you want the current date
              destinationAddress: expense.destinationAddress,
              isAccepted: expense.isAccepted,
              isRejected: expense.isRejected,
            }
          }),
        )
        setExpenses(expensesData)
      } catch (error) {
        console.error("Error fetching expenses:", error)
      }
    }

    fetchExpensesAndBalance()
  }, [])

  const handleAcceptExpense = async (id: number) => {
    if (!window.ethereum) {
      console.error("Please install MetaMask or another Ethereum wallet")
      return
    }

    setLoadingApprove((prev) => ({ ...prev, [id]: true }))

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, abi.abi, signer)

    try {
      const transaction = await contract.acceptExpense(id)
      const receipt = await transaction.wait()

      if (receipt.status === 1) {
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) =>
            expense.id === id ? { ...expense, isAccepted: true, transactionHash: receipt.transactionHash } : expense,
          ),
        )
      }
    } catch (error) {
      console.error("Error accepting expense:", error)
    } finally {
      setLoadingApprove((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleDeclineExpense = async (id: number) => {
    if (!window.ethereum) {
      console.error("Please install MetaMask or another Ethereum wallet")
      return
    }

    setLoadingDecline((prev) => ({ ...prev, [id]: true }))

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, abi.abi, signer)

    try {
      const transaction = await contract.rejectExpense(id)
      const receipt = await transaction.wait()

      if (receipt.status === 1) {
        setExpenses((prevExpenses) =>
          prevExpenses.map((expense) => (expense.id === id ? { ...expense, isRejected: true } : expense)),
        )
      }
    } catch (error) {
      console.error("Error declining expense:", error)
    } finally {
      setLoadingDecline((prev) => ({ ...prev, [id]: false }))
    }
  }

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
    }

    return categories[category] || categories["Other"]
  }

  // Calculate total expenses excluding rejected ones
  const totalExpenses = expenses
    .filter((expense) => !expense.isRejected)
    .reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Overview</h2>
        <div className="flex space-x-3">
          <Card className="w-auto">
            <CardContent className="p-3">
              <div className="text-sm text-muted-foreground">Contract Balance</div>
              <div className="text-2xl font-bold">{contractBalance} CFX</div>
            </CardContent>
          </Card>
         
        </div>
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
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
                    <TableCell>
                      {expense.isAccepted ? (
                        <div className="text-sm text-green-500">
                          Accepted -{" "}
                          <a
                            href={`https://evmtestnet.confluxscan.net/tx/${expense.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            View Transaction
                          </a>
                        </div>
                      ) : expense.isRejected ? (
                        <div className="text-sm text-red-500">Rejected</div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptExpense(expense.id)}
                            className="bg-green-600 hover:bg-green-700 relative"
                            disabled={loadingApprove[expense.id] || loadingDecline[expense.id]}
                          >
                            {loadingApprove[expense.id] ? (
                              <>
                                <span className="opacity-0">Approve</span>
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                </span>
                              </>
                            ) : (
                              "Approve"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeclineExpense(expense.id)}
                            variant="destructive"
                            className="relative"
                            disabled={loadingApprove[expense.id] || loadingDecline[expense.id]}
                          >
                            {loadingDecline[expense.id] ? (
                              <>
                                <span className="opacity-0">Decline</span>
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                </span>
                              </>
                            ) : (
                              "Decline"
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
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
  )
}

