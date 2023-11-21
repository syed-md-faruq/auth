const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const createerror = require('http-errors');
const cookieParser = require("cookie-parser");
require('dotenv').config();
//adding comment
mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost:27017/users").then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.log(err.message));

const authroute = require('./routes/authroutes');
const {verifyaccesstoken} = require('./helpers/jwt');
const app = express();
app.use(cookieParser())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/new',async(req,res) => {
    res.send("new route");
})

app.get('/new2',async(req,res) => {
    res.send("new route 2");

app.get('/new3',async(req,res) => {
    res.send("new route 3");

})

app.get('/', verifyaccesstoken, async (req, res, next) => {
    res.send("Hello user");
});


app.use('/auth', authroute);

app.use(async (req, res, next) => {
    next(createerror.NotFound('route not exist'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
