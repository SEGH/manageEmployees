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
    runMain();
});

// Prompt Question Arrays
const mainQuestions = [
    {
        type: "list",
        message: "What task would you like to do?",
        name: "action",
        choices: ["ADD department", "VIEW all departments", "ADD role", "VIEW all roles", "ADD employee", "VIEW all employees", "UPDATE employee role", "EXIT"]
    }
];

const departmentQuestions = [
    {
        type: "input",
        message: "What is the department's name?",
        name: "deptName"
    }
];

const roleQuestions = [
    {
        type: "input",
        message: "What is the role title?",
        name: "roleTile"
    },
    {
        type: "input",
        message: "What is the salary for this role?",
        name: "roleSalary"
    },
    // Update this prompt to a choice list of current departments in database
    {
        type: "input",
        message: "Which department is this role under? Enter the department's id",
        name: "roleDept"
    }
];

const employeeQuestions = [
    {
        type: "input",
        message: "Enter the employee's first name:",
        name: "firstName"
    },
    {
        type: "input",
        message: "Enter the employee's last name: ",
        name: "lastName"
    },
    // Update following two prompts to choice lists of current data in db
    {
        type: "input",
        message: "What is this employee's role? Enter the role ID",
        name: "employeeRole"
    },
    {
        type: "input",
        message: "Who is this employee's manager? Enter the manger's ID",
        name: "employeeManager"
    }
];

// Function to run main inquirer prompts (choice list)
const runMain = () => {
    inquirer.prompt(mainQuestions).then(choice => {
        switch(choice.action){
            case "ADD department":
                runAddDept();
                break;
            case "VIEW all departments":
                console.log("Option unavailable, select another");
                runMain();
                // runViewDept();
                break;
            case "ADD role":
                runAddRole();
                break;
            case "VIEW all roles":
                console.log("Option unavailable, select another");
                runMain();
                // runViewRole();
                break;
            case "ADD employee":
                runAddEmployee();
                break;
            case "VIEW all employees":
                console.log("Option unavailable, select another");
                runMain();
                // runViewEmployee();
                break;
            case "UPDATE employee role":
                console.log("Option unavailable, select another");
                runMain();
                // runUpdateEmployee();
                break;
            // If Exit is chosen, end connection
            case "EXIT":
                connection.end();
        }
    });
}

// Function to run prompts needed to add departments
const runAddDept = () => {
    inquirer.prompt(departmentQuestions).then(deptRes => {
        console.log(deptRes);
        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to run prompts needed to add roles
const runAddRole = () => {
    inquirer.prompt(roleQuestions).then(roleRes => {
        console.log(roleRes);
        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to run prompts needed to add employees
const runAddEmployee = () => {
    inquirer.prompt(employeeQuestions).then(employeeRes => {
        console.log(employeeRes);
        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to run prompts needed to view departments, roles, and employees
    // Call function to re-run main inquirer prompts again at end

// Function to run prompts needed to update employee roles
    // Call function to re-run main inquirer prompts again at end