const mysql = require("mysql2");
const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = require('./config/connection');
const { init, validate } = require('../../../21-MERN/01-Activities/17-Ins_Apollo-Cache/server/models/Profile');

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
// if connection error, throw error, otherwise...
connection.connect(err => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    onConnection();
});

onConnection = () => {

    console.log("Welcome to the Employee Management System");
    console.log("Application constructed by Joshua Dominguez");

    userPrompt();
};

const init = () => {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'Greetings user, what would you like to do?',
            choices: [
                'Add Department',
                'Add Employee',
                'Add Role',
                'View Departments',
                'View Employees',
                'View Roles',
                'Update Employees',
                'Delete Department',
                'Delete Employee',
                'Delete Role',
                'View Department Budget'
            ]
        })
        .then((answer) => {
            switch (answer.action) {
                case 'Add Department':
                    addDepartment();
                    break;

                case 'Add Employee':
                    addEmployee();
                    break;
                
                case 'Add Role':
                    addRole();
                    break;
                
                case 'View Departments':
                    viewDepartments();
                    break;

                case 'View Employees':
                    viewEmployees();
                    break;

                case 'Update Employees':
                    updateEmployees();
                    break;
                    
                case 'View Roles':
                    viewRoles();
                    break;
                
                case 'Delete Department':
                    deleteDepartment();
                    break;

                case 'Delete Employee':
                    deleteEmployee();
                    break;
                
                case 'Delete Role':
                    deleteRole();
                    break;

                case 'View Department Budget':
                    viewDepartmentBudget();
                    break;

                default:
                    console.log(`Unkown command: ${answer.action}`);
                    break;
            }
        }
    )
};

function addDepartment() {
    const query = 'SELECT id, name as value FROM departments'
    connection.query(query, (err) => {
        if (err) throw err;
        inquirer
            .prompt([{
                type: 'input',
                message: 'What is the name of the new department?',
                name: 'department'
            }]).then((answer) => {
                console.log(answer)
                let query = `INSERT INTO departments (name) VALUES ('${answer.department}');`
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log('DEPARTMENT ADDED SUCCESSFULLY');
                console.log('\n');
                init();
            });
        });
    });
};

function addRole() {
    const query = `SELECT * FROM employee`;
    connection.query(query, (err, departments) => {
        if (err) throw err;
        inquirer
            .prompt([{
                type: 'input',
                message: 'What is the name of the new role?',
                name: 'title'
            },
            {
                type: 'input',
                message: 'What is the salary of this role?',
                name: 'salary',
                validate: (value) => { if (value) {return true} else {return "Please provide a value"} },
            },
            {
                type: 'list',
                message: 'What department will this role belong to?',
                choices: [...departments],
                name: 'department'
            }
            ]).then((answer) => {
                console.log(answer)
                let query = `INSERT INTO role (title, salary, dapartment.id) VALUES 
                ('${answer.title}', '${answer.salary}', '${answer.department}');`
            connection.query(query, (err) => {
                if (err) throw err;
                console.log('ROLE ADDED SUCCESSFULLY');
                console.log('\n');
                init();
            });
        });
    });
};

function addEmployee() {
    const query = 'SELECT id, name as value FROM departments ORDER BY id'
    connection.query(query, (err, departments) => {
        if (err) throw err;
        inquirer
            .prompt([{
                type: 'input',
                message: 'What is the name of the role?',
                name: 'title'
            },
            {
                type: 'input',
                message: 'What will be the salary of this role?',
                name: 'salary',
                validate: (value) => { if (value) {return true} else {return "Please provide a value"} },
            },
            {
                type: 'list',
                message: 'What department will this role belong to?',
                choices: [...departments],
                name: 'department'
            }
            ]).then((answer) => {
                console.log(answer)
                let query = `INSERT INTO role (title, salary, dapartment.id) VALUES 
                ('${answer.title}', '${answer.salary}', '${answer.department}');`
            connection.query(query, (err, res) => {
                if (err) throw err;
                console.log('ROLE ADDED SUCCESSFULLY');
                console.log('\n');
                init();
            });
        });
    });
};

function viewDepartments() {
    const  query = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.query(query, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        init();
    });
};

function viewEmployees() {
    const query = `SELECT employee.id,
        employee.first_name,
        employee.last_name,
        role.title,
        department.name AS department,
        role.salary,
        CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
        LEFT JOIN role ON employee.role_id = role.id
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee manager ON employee.manager_id = manager.id
        `;

        connection.query(query, (err, rows) => {
            if (err) throw err;
            console.table(rows);
            init();
        });
};

function viewRoles() {
    const query = `SELECT role.id,
        role.title, 
        role.salary,
        department.name as department FROM role
        INNER JOIN department ON role.department_id = department.id`;

        connection.query(query, (err, rows) => {
            if (err) throw err;
            console.table(rows);
            init();
        });
};

function updateEmployees() {
    const employeeData = `SELECT first_name, last_name, id FROM employee`;

    connection.query(employeeData, (err, empRes) => {
        if (err) throw err;
        const employees = [];
        empRes.forEach( ({ first_name, last_name, id }) => {
            employees.push({
                name: first_name + " " + last_name,
                value: id
            });
        });
        console.log(employees);

        const roleData = `SELECT * FROM role`;

        connection.query(roleData, (err, roleRes) => {
            if (err) throw err;
            const roles = [];
            roleRes.forEach( ({ title, id }) => {
                roles.push(
                    {
                        name: title,
                        value: id
                    }
                );
            });

            inquirer.init([
                {
                    type: "list",
                    message: "Which employee's role would you like to change?",
                    name: "id",
                    choices: employees
                },
                {
                    type: "list",
                    message: "What is this employee's new role?",
                    name: "role_id",
                    choices: roles
                },
            ])
            .then( answers => { 
                console.log("answers:", answers);                
                const data = `UPDATE employee SET role_id = ? WHERE id = ?`;

                connection.query(data, [answers.role_id, answers.id], (err) => {
                    if (err) throw err;
                    console.log("Employee's role updated successfully.");
                    init();
                });
            })
            .catch( err => {
                console.log(err);
            })
        });
    });
};
