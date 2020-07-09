// Dependencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const cTable = require("console.table");
require("dotenv").config();

// Database Connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.DB_PASS,
    database: "manageEmployeesDB"
});

connection.connect((err) => {
    if (err) throw err;

    console.log("Connected as id " + connection.threadId);

    // Call function that runs main inquirer prompts
});

// Prompt Question Arrays
const mainQuestions = [
    {
        type: "list",
        message: "What task would you like to do?",
        name: "action",
        choices: ["ADD department", "VIEW all departments", "ADD role", "VIEW all roles", "ADD employee", "EXIT"]
    }
];

// Function to run main inquirer prompts (choice list)
    // If Exit is chosen, end connection

// Function to run prompts needed to add departments, roles, and employees
    // Call function to re-run main inquirer prompts again at end

// Function to run prompts needed to view departments, roles, and employees
    // Call function to re-run main inquirer prompts again at end

// Function to run prompts needed to update employee roles
    // Call function to re-run main inquirer prompts again at end