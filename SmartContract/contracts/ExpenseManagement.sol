// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExpenseManagement {
    // Struct to represent an expense
    struct Expense {
        uint256 id;
        string title;
        string description;
        string category;
        uint256 amount; // Amount in ETH
        address destinationAddress;
        address createdBy; // Address of the user who created the expense
        bool isAccepted;
        bool isRejected;
    }

    // Mapping to store expenses by their ID
    mapping(uint256 => Expense) public expenses;

    // Mapping to store expense IDs by the address of the user who created them
    mapping(address => uint256[]) public expensesByCreator;

    // Counter to generate unique IDs for expenses
    uint256 public expenseCounter;

    // Event to log when an expense is created
    event ExpenseCreated(
        uint256 id,
        string title,
        string description,
        string category,
        uint256 amount,
        address destinationAddress,
        address createdBy
    );

    // Event to log when an expense is accepted
    event ExpenseAccepted(uint256 id, uint256 amount, address destinationAddress);

    // Event to log when an expense is rejected
    event ExpenseRejected(uint256 id);

    // Function to create a new expense
    function createExpense(
        string memory _title,
        string memory _description,
        string memory _category,
        uint256 _amount,
        address _destinationAddress
    ) public {
        require(_amount > 0, "Amount must be greater than 0");
        require(_destinationAddress != address(0), "Invalid destination address");

        expenseCounter++;
        expenses[expenseCounter] = Expense({
            id: expenseCounter,
            title: _title,
            description: _description,
            category: _category,
            amount: _amount,
            destinationAddress: _destinationAddress,
            createdBy: msg.sender, // Store the address of the user who created the expense
            isAccepted: false,
            isRejected: false
        });

        // Add the expense ID to the list of expenses created by this user
        expensesByCreator[msg.sender].push(expenseCounter);

        emit ExpenseCreated(
            expenseCounter,
            _title,
            _description,
            _category,
            _amount,
            _destinationAddress,
            msg.sender
        );
    }

    // Function to accept an expense and transfer the amount to the destination address
    function acceptExpense(uint256 _id) public payable {
        require(expenses[_id].id != 0, "Expense does not exist");
        require(!expenses[_id].isAccepted, "Expense is already accepted");
        require(!expenses[_id].isRejected, "Expense is already rejected");

        Expense storage expense = expenses[_id];

        // Ensure the contract has enough balance to transfer the amount
        require(address(this).balance >= expense.amount, "Insufficient contract balance");

        // Mark the expense as accepted
        expense.isAccepted = true;

        // Transfer the amount to the destination address
        (bool success, ) = expense.destinationAddress.call{value: expense.amount}("");
        require(success, "Transfer failed");

        emit ExpenseAccepted(_id, expense.amount, expense.destinationAddress);
    }

    // Function to reject an expense
    function rejectExpense(uint256 _id) public {
        require(expenses[_id].id != 0, "Expense does not exist");
        require(!expenses[_id].isAccepted, "Expense is already accepted");
        require(!expenses[_id].isRejected, "Expense is already rejected");

        expenses[_id].isRejected = true;

        emit ExpenseRejected(_id);
    }

    // Function to get details of an expense by ID
    function getExpense(uint256 _id) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory category,
        uint256 amount,
        address destinationAddress,
        address createdBy,
        bool isAccepted,
        bool isRejected
    ) {
        require(expenses[_id].id != 0, "Expense does not exist");

        Expense memory expense = expenses[_id];
        return (
            expense.id,
            expense.title,
            expense.description,
            expense.category,
            expense.amount,
            expense.destinationAddress,
            expense.createdBy,
            expense.isAccepted,
            expense.isRejected
        );
    }

    // Function to get all expense IDs created by a specific address
    function getExpensesByCreator(address _creator) public view returns (uint256[] memory) {
        return expensesByCreator[_creator];
    }

    // Fallback function to accept ETH deposits into the contract
    receive() external payable {}
}