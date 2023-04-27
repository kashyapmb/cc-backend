const ErrorHandler = require("../utils/ErrorHandler")
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
    const { token } = req.cookies

    if(!token){
        return next(new ErrorHandler(401, "Please login to access resources"));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedData.id);
    if(!user){
        return next(new ErrorHandler(404, "User not found"));
    }
    req.user = user;
    next();
}