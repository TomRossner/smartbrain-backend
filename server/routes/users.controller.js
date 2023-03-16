const {User} = require("../models/models");
const {
    checkUserPassword,
    storeUserPassword
} = require("../bcrypt");
const {createUser, signInUser, signInGoogleUser} = require("../firebase");


// Utility functions

async function getAllUsers() {
    return await User.find({});
}

async function getUserById(id) {
    return await User.findOne({_id: id});
}

async function getUserByEmail(email) {
    return await User.findOne({email: email});
}



// Controller functions

async function addNewUser(req, res) {
    try {
        const {name, email, password} = req.body;
        const isUserAlreadyRegistered = await getUserByEmail(email);
        if (isUserAlreadyRegistered) return res.status(400).send({error: "User already registered"});
        else {
            const newUser = await new User({name, email, imgUrl: "", predictions: 0}).save();
            storeUserPassword(email, password, 10);
            // createUser(email, password); // From Firebase
            res.status(200).send(newUser);
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({error});
    }
}

async function login(req, res) {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email}).select({password: 0, _id: 0});
        const userHash = await User.findOne({email: user.email}).select({_id: 0, password: 1});
        const isPasswordValid = await checkUserPassword(password, userHash.password);
        // signInUser(email, password); // From Firebase
        if (user && isPasswordValid) return res.status(200).send(user);
        else return res.status(400).send({error: "User not found"});
    } catch (error) {
        console.log(error);
        res.status(400).send({error});
    }
}

// const loginWithGoogle = async (req, res) => {
//     try {
//         const user = await signInGoogleUser();
//         console.log(user);
//     } catch (error) {
//         console.log(error);
//     }
// }

async function addPrediction(req, res) {
    try {
        const {id} = req.params;
        const user = await getUserById(id);
        const updatedUser = await User.updateOne({_id: user._id}, {
            $set: {
                predictions: user.predictions + 1
            }
        })
        return res.status(200).send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(400).send({error});
    }
}

async function updateUser(req, res) {
    try {
        const {email} = req.params;
        const {predictions, imgUrl} = req.body;
        const updatedUser = await User.updateOne({email: email}, {
            $set: {
                predictions,
                imgUrl
            }
        })
        res.status(200).send(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(400).send({error});
    }
}

module.exports = {
    getAllUsers,
    addNewUser,
    login,
    updateUser,
    addPrediction,
    // loginWithGoogle
}