const express = require('express');
const app = express();
const PORT = 5001;
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");
const predictRouter = require("./clarifai");
// const predictRouterBytes = require("./clarifaiBytes");
const Router = require('./routes/users.routes');
const mongoose = require("mongoose");
const morgan = require("morgan");

mongoose.set("strictQuery", false);

app.use(express.urlencoded({limit: '20mb', extended: true}));
app.use(express.json({ limit: '20mb' }));
app.use(cors());
app.use(morgan("dev"));
app.use("/smartbrain/auth", Router);
app.use("/smartbrain/predict", predictRouter);
// app.use("/predict-bytes", predictRouterBytes);

async function connectDB() {
  return mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to SmartBrainDB"))
    .catch(() => console.log("Failed connecting to database"));
}

async function init() {
  await connectDB();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

if (process.env.NODE_ENV === 'development') {
  init();
} else {
  const https = require('https');
  const fs = require('fs');
  const path = require('path');
  
  const certPath = path.resolve(process.env.CERT_PATH);
  const certFilePath = path.join(certPath, 'fullchain.pem');
  const privateKeyPath = path.join(certPath, 'privkey.pem');
  
  const certificate = fs.readFileSync(certFilePath);
  const privateKey = fs.readFileSync(privateKeyPath);
  
  const options = {
      key: privateKey,
      cert: certificate,
  }
  
  const https_Server = https.createServer(options, app);

  async function initHTTPS() {
    await connectDB();

    const NUM_WORKERS = os.cpus().length;
  
    if (cluster.isMaster) {

      for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
      }

      console.log(`Master process started, forking ${NUM_WORKERS} worker processes...`);
    } else {
      console.log("Worker process started");
      https_Server.listen(PORT, () => console.log(`HTTPS server running on port ${PORT}`));
    }
  }
  
  initHTTPS();
}