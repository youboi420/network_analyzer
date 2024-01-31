import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_UPWD = process.env.DB_UPWD
const DB_DBS = process.env.DB_DBS

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_UPWD,
  database: DB_DBS,
});

const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
	id INT NOT NULL AUTO_INCREMENT,
	username VARCHAR(50) NOT NULL,
	password VARCHAR(50) NOT NULL,
	isadmin TINYINT NOT NULL,
	PRIMARY KEY (id)
)`;

const createReportsTableQuery = `
CREATE TABLE IF NOT EXISTS reports (
	report_id INT NOT NULL AUTO_INCREMENT,
	owner_username VARCHAR(50) NOT NULL,
	owner_id INT NOT NULL,
	creation_date DATETIME DEFAULT NOW(),
	path VARCHAR(256) NOT NULL,
	PRIMARY KEY (report_id)
)`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

connection.query(createUsersTableQuery, (queryErr, results) => {
	if (queryErr) {
		console.error('Error creating table:', queryErr);
	} else {
		console.log('Table created successfully');
	}
});

connection.query(createReportsTableQuery, (queryErr, results) => {
	if (queryErr) {
		console.error('Error creating table:', queryErr);
	} else {
		console.log('Table created successfully');
	}
});

connection.end();