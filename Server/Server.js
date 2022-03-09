const express = require('express');
const dbConnect = require('./Database');
require('dotenv').config();
const routes = require('./Routes/Router')
var cors = require("cors")
const cookieParser = require("cookie-parser")

const app = express();

dbConnect()

app.use(cookieParser())
const corsOption = {
    credentials: true,
    origin: 'http://localhost:3000',
};

app.use(cors(corsOption));
app.use(express.json({ limit: "8mb" }));
app.use('/api', routes);

app.use("/userImages", express.static('userImages'))

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send("Hi...")
})

app.listen(PORT, () => {
    console.log("server is running at port " + PORT)
})