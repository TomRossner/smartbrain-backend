const express = require("express");
const Router = express.Router();
const {
    getAllUsers,
    addNewUser,
    login,
    updateUser,
    addPrediction,
    updateProfileImg,
} = require("../controllers/users.controller");

Router.get('/users', getAllUsers);

Router.post('/users', addNewUser);

Router.post("/login", login);

Router.put("/update-predictions/:id", addPrediction);

Router.put("/update-user/:email", updateUser);

Router.put("/update-profile-img/:email", updateProfileImg);

module.exports = Router;