import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import passport from "passport";
import connectDB from "./src/config/mongoose.js";
import routes from "./src/routes/index.js";

import "./src/config/passport.js";

const app = express();

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
}

const allowedOrigins = [process.env.CLIENT_APP_URL, "http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

connectDB().then(() => {
  console.log("✅ MongoDB Connected Successfully");
});

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("API is working!");
});
app.listen(PORT, "0.0.0.0", () => console.log("Server started"));

export default app;
