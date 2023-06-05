const express = require("express");
const predictRouter = express.Router();
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
require('dotenv').config();
const Buffer = require("buffer").Buffer;


const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
    
const USER_ID = process.env.USER_ID;
const PAT = process.env.API_KEY;
const APP_ID = process.env.APP_ID;
const MODEL_ID = process.env.MODEL_ID;
const MODEL_VERSION_ID = '';

metadata.set("authorization", `Key ${PAT}`);

const predictImage = (inputs) => {
    return new Promise((resolve, reject) => {
        stub.PostModelOutputs(
            {
                user_app_id: {
                    "user_id": USER_ID,
                    "app_id": APP_ID
                },
                model_id: MODEL_ID,
                version_id: MODEL_VERSION_ID,
                inputs
            },
            metadata,
            (err, response) => {
                if (err) {
                    reject(err);
                }
        
                if (response.status.code !== 10000) {
                    reject("Post model outputs failed, status: " + response.status.description);
                }
                
                try {
                    const results = [];
                    const output = response.outputs[0];
                    const {regions} = output?.data;
                    results.push(regions);
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            }
        );
    })  
}

function convertURL(url) {
    const urlToBuffer = url.split(',')[1];
    const bufferedURL = Buffer.from(urlToBuffer, 'base64');
    const convertedToBase64String = bufferedURL.toString('base64');
    return convertedToBase64String;
}

predictRouter.post("/", async (req, res) => {
    try {
        let {url} = req.body;
        url = url.substring(0, 5) === "https"
        ? url
        : convertURL(url);
        
        const HTTPS_inputs = [
            {
                data: {
                    image: {
                        url
                    }
                }
            }
        ]

        const BASE64_inputs = [
            {
                data: {
                    image: {
                        base64: url
                    }
                }
            }
        ];

        const results = await predictImage(url.substring(0, 5) === "https" ? HTTPS_inputs : BASE64_inputs);
        return res.status(200).send({results});
    } catch (error) {
        return res.status(400).send({error});
    }
})

module.exports = predictRouter;