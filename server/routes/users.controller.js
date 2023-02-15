const {User} = require("../models/models");
const {
    checkUserPassword,
    storeUserPassword
} = require("../bcrypt");
const {setJwt} = require("../jwt");
const {createUser, signInUser, signInGoogleUser} = require("../firebase");


// Utility functions

const getAllUsers = async () => {
    return await User.find({});
}

const getUserById = async (id) => {
    return await User.findOne({_id: id});
}

const getUserByEmail = async (email) => {
    return await User.findOne({email: email});
}



// Controller functions

const addNewUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        const isUserAlreadyRegistered = await getUserByEmail(email);
        if (isUserAlreadyRegistered) return res.status(400).send("User already registered");
        else {
            const newUser = new User({name, email, imgUrl: "", predictions: 0});
            await newUser.save();
            const user = await getUserById(newUser._id);
            storeUserPassword(email, password, 10);
            // createUser(email, password); // From Firebase
            // setJwt(user._id); // TO BE IMPLEMENTED
            res.status(200).send(user);
        }
    } catch (error) {
        console.log(error);
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email}).select({password: 0, _id: 0});
        const userHash = await User.findOne({email: user.email}).select({_id: 0, password: 1});
        const isPasswordValid = await checkUserPassword(password, userHash.password);
        // signInUser(email, password); // From Firebase
        if (user && isPasswordValid) return res.status(200).send(user);
        else return res.status(400).send("User not found");
    } catch (error) {
        console.log(error);
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

const addPrediction = async (req, res) => {
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
    }
}

const updateUser = async (req, res) => {
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