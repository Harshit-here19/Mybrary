require('dotenv').config()

const express = require('express');
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

app.set("view engine", "ejs")
app.set("views", __dirname + "/views")
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose');
const DATABASE_URL = process.env.DATABASE_URL;
mongoose.connect(DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to Mongoose'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

const port = 3000
app.listen(process.env.PORT || port, () => {
    console.log(`server is running on port : ${port}`)
})