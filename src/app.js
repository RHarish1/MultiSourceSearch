const express = require('express');
const app = express();
const port = 3000;
import 'dotenv/config';
app.use(express.json());



app.get("/home", (req, res) => {
    res.send("Welcome to our app!");
})

app.get("/", (req, res) => {
    res.redirect("/home");
})

// req : { "username": , "password": }
app.post("/login", (req, res) => {
    const { username, password } = req.body;
})  