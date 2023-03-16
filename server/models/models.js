const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {type: String},  
    email: {type: String},  
    password: {type: String},  
    predictions: {type: Number},
    created_at: {type: Date, default: Date.now()},
    imgUrl: {type: String}
},
{collection: "users"})

userSchema.methods.signJWT = function() {
    const token = jwt.sign({_id: this._id, email: this.email}, process.env.JWT_PRIVATE_KEY);
    return token;
}

const User = mongoose.model("User", userSchema);

module.exports = {
    User
}