import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import sendResponse from "../utils/response.util.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, "Authorization token missing or invalid", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.SECRET_KEY;

    let decodedUser = jwt.verify(token, secret);

    let user = await User.findById(decodedUser.id).select("-password");

    if (!user) return sendResponse(res, "User not found", 404);

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role ?? "personal",
    };

    next();
  } catch (error) {
    return sendResponse(res, "Invalid or expired token", 401);
  }
};

export default isLoggedIn;
