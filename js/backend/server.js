/* lib's */
import express from 'express'
import dotenv from 'dotenv'

/* local moudle's */
import { connect_to_db } from './sql_services/db_service.js'
import { create_json_report_table } from './sql_services/report_service.js'


dotenv.config()

const app = express()
const port = process.env.PORT

app.use(express.json())

const initialize = async () => {
  try {
		await connect_to_db()
    await create_json_report_table()
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Error initializing server:', error)
  }
}

initialize()
sql_rest_controller()
// import express from "express"
// import mysql from "mysql"
// import cors from "cors"

// const app = express()
// app.use(cors())
// app.use(express.json())

// const db = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	password: "root",
// 	database: "test_db",
// })

// app.get("/", (req, res) => {
// 	res.json("hello")
// })

// app.listen(8800, () => {
// 	console.log("Connected to backend.")
// })

// // app.get("/books", (req, res) => {
// 	// 	const q = "SELECT * FROM books"
// // 	db.query(q, (err, data) => {
// // 		if (err) {
// // 			console.log(err)
// // 			return res.json(err)
// // 		}
// // 		return res.json(data)
// // 	})
// // })

// // app.post("/books", (req, res) => {
// // 	const q = "INSERT INTO books(`title`, `desc`, `price`, `cover`) VALUES (?)"

// // 	const values = [
// // 		req.body.title,
// // 		req.body.desc,
// // 		req.body.price,
// // 		req.body.cover,
// // 	]

// // 	db.query(q, [values], (err, data) => {
// // 		if (err) return res.send(err)
// // 		return res.json(data)
// // 	})
// // })

// // app.delete("/books/:id", (req, res) => {
// // 	const bookId = req.params.id
// // 	const q = " DELETE FROM books WHERE id = ? "

// // 	db.query(q, [bookId], (err, data) => {
// // 		if (err) return res.send(err)
// // 		return res.json(data)
// // 	})
// // })

// // app.put("/books/:id", (req, res) => {
// // 	const bookId = req.params.id
// // 	const q = "UPDATE books SET `title`= ?, `desc`= ?, `price`= ?, `cover`= ? WHERE id = ?"

// // 	const values = [
// // 		req.body.title,
// // 		req.body.desc,
// // 		req.body.price,
// // 		req.body.cover,
// // 	]

// // 	db.query(q, [...values, bookId], (err, data) => {
// // 		if (err) return res.send(err)
// // 		return res.json(data)
// // 	})
// // })
