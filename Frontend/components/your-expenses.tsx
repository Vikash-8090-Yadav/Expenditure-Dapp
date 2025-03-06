"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface Expense {
  id: number
  title: string
  description: string
  category: string
  amount: string
  date: string
}

interface YourExpensesProps {
  expenses: Expense[]
}

export default function YourExpenses({ expenses }: YourExpensesProps) {
  // Calculate category totals
  const categoryTotals = expenses.reduce(
    (acc, expense) => {
      const category = expense.category
      const amount = Number.parseFloat(expense.amount)

      if (!acc[category]) {
        acc[category] = 0
      }

      acc[category] += amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Prepare data for charts
  const pieChartData = Object.keys(categoryTotals).map((category) => ({
    name: category,
    value: categoryTotals[category],
  }))

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c"]

  // Monthly data (simplified for demo)
  const monthlyData = [
    { name: "Jan", amount: 1200 },
    { name: "Feb", amount: 900 },
    { name: "Mar", amount: 1500 },
    { name: "Apr", amount: 1000 },
    { name: "May", amount: 800 },
    { name: "Jun", amount: 1300 },
  ]

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Expenses</h2>

      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} ETH</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Per Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {expenses.length ? (totalExpenses / expenses.length).toFixed(2) : "0.00"} ETH
                </div>
                <p className="text-xs text-muted-foreground">-4.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Number of Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
                <p className="text-xs text-muted-foreground">+12 since last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "None"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])[0]?.[1]
                    .toFixed(2) || "0.00"}{" "}
                  ETH
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Expense by Category</CardTitle>
              <CardDescription>Breakdown of your expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} ETH`, "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
              <CardDescription>Your expense trends over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} ETH`, "Amount"]} />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" name="Expense Amount (ETH)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

