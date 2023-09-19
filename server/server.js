import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "./Config/db.js";
import { PORT } from "./Config/globalKey.js";
import router from "./Router/index.js";
import fileUpload from "express-fileupload";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json({ extended: true, limit: "500mb", parameterLimit: 500 }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb", parameterLimit: 500 }));

app.use("/api/v1.0.0", router);
app.use("/api/v1.0.0/upload", express.static("assets"))
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    // res.header("Access-Control-Allow-Headers", true);
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
  });
app.listen(PORT, ()=>{
    console.log(`server is Running http://localhost:${PORT}`);
})