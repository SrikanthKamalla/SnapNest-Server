import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";
import redisClient from "../config/redisClient.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, "Authorization token missing or invalid", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.SECRET_KEY;

    let decodedUser = jwt.verify(token, secret);

    let cachedUser = await redisClient.get(decodedUser.id);
    let user;

    if (!cachedUser) {
      user = await User.findById(decodedUser.id).select("-password");
      if (!user) return sendResponse(res, "User not found", 404);

      await redisClient.setEx(decodedUser.id, 60, JSON.stringify(user));
      console.log("fetching from db");
    } else {
      console.log("fetching from redis cache");
      user = JSON.parse(cachedUser);
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role ?? "personal",
    };

    next();
  } catch (error) {
    console.log(error);
    return sendResponse(res, "Invalid or expired token", 401);
  }
};

export default isLoggedIn;
