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

// Choice Arrays
const departments = [];
const roles = [];
const employees = [];

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
        name: "roleTitle"
    },
    {
        type: "input",
        message: "What is the salary for this role?",
        name: "roleSalary"
    },
    {
        type: "list",
        message: "Which department is this role under?",
        name: "roleDept",
        choices: departments
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
    }
];

// Function to run main inquirer prompts (choice list)
const runMain = () => {

    connection.query("SELECT * FROM department", function (err, res) {
        if (res.length === 0) {
            runAddDept();
        }
        else {
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
    // Check what departments are in the database
    connection.query("SELECT * FROM manageEmployeesDB.department", function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {
            departments.push(res[i].name);
        }

        inquirer.prompt(roleQuestions).then(roleRes => {
            connection.query("SELECT id FROM manageEmployeesDB.department WHERE name = ?", [roleRes.roleDept], function (err, res) {
                if (err) throw err;

                connection.query("INSERT INTO role SET ?",
                    {
                        title: roleRes.roleTitle,
                        salary: roleRes.roleSalary,
                        department_id: res[0].id

                    }, function (err, res) {
                        if (err) throw err;
                        console.log(res.affectedRows + " role created!");
                        // Call function to re-run main inquirer prompts again at end
                        runMain();
                    });
            });
        });
    });
}

// Function to run prompts needed to add employees
const runAddEmployee = () => {

    inquirer.prompt(employeeQuestions).then(employeeRes => {
        // Check roles in database
        connection.query("SELECT * FROM manageEmployeesDB.role", function (err, res) {
            if (err) throw err;
            if (res.length === 0) {
                console.log("You need to add a role first");
                runMain();
            } else {

                for (let i = 0; i < res.length; i++) {
                    roles.push(res[i].title);
                }

                inquirer.prompt([
                    {
                        type: "list",
                        message: "What is this employee's role?",
                        name: "employeeRole",
                        choices: roles
                    }
                ]).then(employeeRole => {
                    connection.query("SELECT id FROM manageEmployeesDB.role WHERE title = ?", [employeeRole.employeeRole], function (err, res) {
                        if (err) throw err;
                        console.log(employeeRes);
                        console.log(res);
                        let roleID = res[0].id;
                        connection.query("SELECT * FROM manageEmployeesDB.employee", function (err, res) {
                            if (err) throw err;

                            for (let i = 0; i < res.length; i++) {
                                let fullName = `${res[i].first_name} ${res[i].last_name}`;
                                employees.push(fullName);
                            }
                            employees.push("This employee does not have a manager");

                            inquirer.prompt([
                                {
                                    type: "list",
                                    message: "Who is this employee's manager?",
                                    name: "employeeManager",
                                    choices: employees
                                }
                            ]).then(managerName => {
                                if (managerName.employeeManager === "This employee does not have a manager") {
                                    connection.query("INSERT INTO employee SET ?",
                                        {
                                            first_name: employeeRes.firstName,
                                            last_name: employeeRes.lastName,
                                            role_id: roleID

                                        }, function (err, res) {
                                            if (err) throw err;
                                            console.log(res.affectedRows + " employee created!");
                                            // Call function to re-run main inquirer prompts again at end
                                            runMain();
                                        });
                                } else {
                                    let nameArray = managerName.employeeManager.split(" ");
                                    let first = nameArray[0];
                                    let last = nameArray[1];
                                    connection.query("SELECT id FROM manageEmployeesDB.employee WHERE first_name = ? AND last_name = ?", [first, last], function (err, res) {
                                        if (err) throw err;

                                        connection.query("INSERT INTO employee SET ?",
                                            {
                                                first_name: employeeRes.firstName,
                                                last_name: employeeRes.lastName,
                                                role_id: roleID,
                                                manager_id: res[0].id

                                            }, function (err, res) {
                                                if (err) throw err;
                                                console.log(res.affectedRows + " employee created!");
                                                // Call function to re-run main inquirer prompts again at end
                                                runMain();
                                            });
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });
    });
}

// Function to view all departments
const runViewDept = () => {
    connection.query("SELECT * FROM manageEmployeesDB.department", function (err, res) {
        if (err) throw err;

        console.table("------VIEWING ALL DEPARTMENTS------", res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to view all roles
const runViewRole = () => {
    connection.query("SELECT role.id, role.title, role.salary, department.name AS department FROM role INNER JOIN department ON role.department_id = department.id", function (err, res) {
        if (err) throw err;

        console.table("------   VIEWING ALL ROLES   ------", res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to view all employees
const runViewEmployee = () => {
    connection.query("SELECT A.id, A.first_name, A.last_name, role.title, role.salary, department.name AS department, CONCAT(B.first_name, ' ', B.last_name) AS manager FROM employee A LEFT JOIN employee B ON A.manager_id = B.id INNER JOIN role ON A.role_id = role.id INNER JOIN department ON role.department_id = department.id;", function (err, res) {
        if (err) throw err;
        console.table("------   VIEWING ALL EMPLOYEES   ------", res);

        // Call function to re-run main inquirer prompts again at end
        runMain();
    });
}

// Function to run prompts needed to update employee roles
const runUpdateEmployee = () => {
    // Need to run connection query to check current employees in database and list in prompt
    connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS names FROM employee;", function (err, res) {
        if (err) throw err;

        if (res.length === 0) {
            console.log("There are no employees to update");
            runMain();
        } else {
            for (let i = 0; i < res.length; i++) {
                employees.push(res[i].names);
            }

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select an employee to update",
                    name: "fullName",
                    choices: employees
                }
            ]).then(selectedEmployee => {
                let employeeDataArray = res.filter(obj => obj.names === selectedEmployee.fullName);
                let selectedID = employeeDataArray[0].id;
                // Then run connection query to check current roles in database and list in prompt
                connection.query("SELECT id, title FROM role;", function (err, res) {
                    if (err) throw err;

                    for (let i = 0; i < res.length; i++) {
                        roles.push(res[i].title);
                    }

                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Select a new role for this employee",
                            name: "newRole",
                            choices: roles
                        }
                    ]).then(newRole => {
                        let roleDataArray = res.filter(obj => obj.title === newRole.newRole);
                        let selectedRoleID = roleDataArray[0].id;
                        // connection query to update role_id where employee id matches from selected
                        connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [selectedRoleID, selectedID], function (err, res) {
                            if (err) throw err;

                            console.log(res.affectedRows + " employee updated!");
                            runMain();
                        });
                    });
                });
            });
        }
    });
}