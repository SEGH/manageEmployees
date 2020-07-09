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
        switch (choice.action) {
            case "ADD department":
                runAddDept();
                break;
            case "VIEW all departments":
                runViewDept();
                break;
            case "ADD role":
                runAddRole();
                break;
            case "VIEW all roles":
                runViewRole();
                break;
            case "ADD employee":
                runAddEmployee();
                break;
            case "VIEW all employees":
                runViewEmployee();
                break;
            case "UPDATE employee role":
                runUpdateEmployee();
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

        // Query to check if department name is already in database
        connection.query("SELECT name FROM manageEmployeesDB.department WHERE name = ?", [deptRes.deptName], function (err, res) {
            if (err) throw err;

            if (res.length === 0) {
                // If not, create the department
                connection.query("INSERT INTO department SET ?",
                    {
                        name: deptRes.deptName
                    },
                    function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + " department added!");

                        // Call function to re-run main inquirer prompts again at end
                        runMain();
                    });
            } else {
                // If so, return back to main menu
                console.log("Department already exists!")
                runMain();
            }
        });
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

// Function to view all departments
const runViewDept = () => {
    connection.query("SELECT * FROM manageEmployeesDB.department", function (err, res) {
        if (err) throw err;

        console.log("------VIEWING ALL DEPARTMENTS------");
        console.table(res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to view all roles
const runViewRole = () => {
    // Need JOIN query to view department name
    connection.query("SELECT * FROM manageEmployeesDB.role", function (err, res) {
        if (err) throw err;

        console.log("------VIEWING ALL ROLES------");
        console.table(res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to view all employees
const runViewEmployee = () => {
    // Need JOIN queries to view title, department name, salary, and manager name
    connection.query("SELECT employee.id, employee.first_name, employee.last_name FROM manageEmployeesDB.employee", function (err, res) {
        if (err) throw err;
        console.log("------VIEWING ALL EMPLOYEES------");
        console.table(res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to run prompts needed to update employee roles
const runUpdateEmployee = () => {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the id of the employee you'd like to update:",
            name: "employeeId"
        },
        {
            type: "input",
            message: "Enter the role ID you'd like this employee to be associated with:",
            name: "roleId"
        }
    ]).then(newData => {
        console.log(newData);
        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}