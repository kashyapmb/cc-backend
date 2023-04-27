const app = require('./app');
const cloudinary = require('cloudinary');

const dotenv = require('dotenv');
dotenv.config({path: "config/config.env"});

const connectToMongo = require('./config/db');
connectToMongo();

cloudinary.config({
    cloud_name: "dfahmk4ht",
    api_key: "954436565465197",
    api_secret: "ajHl1tefZ769WX4gapWBVQioZeU"
})

app.listen(process.env.PORT, ()=>{
    console.log(`Server running at ${process.env.HOST}:${process.env.PORT}`);
})