const express = require('express');
const app = express();
const port = 5001;
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");
const predictRouter = require("./clarifai");
const predictRouterBytes = require("./clarifaiBytes");
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

async function startServer() {
  await connectDB();

  const NUM_WORKERS = os.cpus().length;
  
  if (cluster.isMaster) {

    for (let i = 0; i < NUM_WORKERS; i++) {
      cluster.fork();
    }
    console.log(`Master process started, forking ${NUM_WORKERS} worker processes...`);
  } else {
    console.log("Worker process started");
    app.listen(port, () => console.log(`Listening on port ${port}`));
  }
}

startServer();