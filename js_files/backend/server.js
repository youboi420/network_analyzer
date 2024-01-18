import express from "express"

const app = express()
const PORT = 8800

app.listen(PORT, () => {
    console.log("Connected to backend")    
})

/* 
    TODO
    fetch sql q and return the data accordingly
 */
app.get( ("/"), (req, res) => {
    res.json("Welcome from backend")
})