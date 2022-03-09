const mongoose = require("mongoose");

const dbConnect = () => {
    const dbUrl = process.env.DB_URL;

    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("successfully connected with the database.....")
        })
        .catch((res) => {
            console.log(res)
        })
}


module.exports = dbConnect;