require('dotenv').config();

const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())


// DB Connection

const conn = require("./db/conn");
conn();

// Routes
const routes = require('./routes/router')
app.use('/organize', routes)




app.listen(3000, () => console.log('Server Started'));

