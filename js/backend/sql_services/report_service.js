import mysql from "mysql";

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

const create_report = ``