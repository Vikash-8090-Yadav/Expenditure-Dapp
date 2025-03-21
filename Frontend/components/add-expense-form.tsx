"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ethers } from "ethers"
import { marketplaceAddress } from "../config"

import abi from "../Abi/ExpenseManagement.json"
import { ToastContainer, toast } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"

interface AddExpenseFormProps {
  onAddExpense: (expense: {
    title: string
    description: string
    category: string
    amount: string
    destinationAddress: string
  }) => void
}

export default function AddExpenseForm({ onAddExpense }: AddExpenseFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [destinationAddress, setDestinationAddress] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !category || !amount || !destinationAddress) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Validate Ethereum address
      if (!ethers.utils.isAddress(destinationAddress)) {
        toast.error("Please enter a valid Ethereum address")
        setIsSubmitting(false)
        return
      }

      if (!window.ethereum) {
        throw new Error("Please install MetaMask or another Ethereum wallet")
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()

      const price = ethers.utils.parseEther(amount)
      const contract = new ethers.Contract(marketplaceAddress, abi.abi, signer)

      // Create transaction
      const transaction = await contract.createExpense(title, description, category, price, destinationAddress)

      // Wait for transaction to be mined
      const receipt = await transaction.wait()

      if (receipt.status === 1) {
        toast.success("Expense added successfully!")

        // Only call onAddExpense after successful transaction
        onAddExpense({
          title,
          description,
          category,
          amount,
          destinationAddress,
        })

        // Reset form
        setTitle("")
        setDescription("")
        setCategory("")
        setAmount("")
        setDestinationAddress("")
      } else {
        toast.error("Transaction failed. Please try again.")
      }
    } catch (error) {
      console.error("Error adding expense:", error)
      toast.error("Failed to add expense. See console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>Fill in the details to add a new expense to your tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Expense title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details about this expense"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CFX) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination Address *</Label>
            <Input
              id="destination"
              placeholder="0x..."
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="relative">
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Add Expense</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                "Add Expense"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
      <ToastContainer position="top-right" autoClose={5000} />
    </Card>
  )
}

