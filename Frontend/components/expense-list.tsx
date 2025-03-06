import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
interface Expense {
  id: number
  title: string
  description: string
  category: string
  amount: string
  date: string
  destinationAddress?: string
}

interface ExpenseListProps {
  expenses: Expense[]
  onApproveExpense?: (id: number) => void
  onDeclineExpense?: (id: number) => void
}

export default function ExpenseList({
  expenses,
  onApproveExpense = () => {},
  onDeclineExpense = () => {},
}: ExpenseListProps) {
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

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number.parseFloat(expense.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expense Overview</h2>
        <Card className="w-auto">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Expenses</div>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} ETH</div>
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
                <TableHead className="text-right">Amount (ETH)</TableHead>
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
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onApproveExpense(expense.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button size="sm" onClick={() => onDeclineExpense(expense.id)} variant="destructive">
                          Decline
                        </Button>
                      </div>
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

