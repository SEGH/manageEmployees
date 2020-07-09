INSERT INTO department (name) VALUES ("test department");

INSERT INTO role (title, salary, department_id) VALUES ("manager", 100000, 1), ("intern", 50000, 1);

INSERT INTO employee (first_name, last_name, role_id) VALUES ("test", "one", 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("test", "two", 2, 1);