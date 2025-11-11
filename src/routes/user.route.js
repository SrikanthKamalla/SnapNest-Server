import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../config/passport.js";

import isLoggedIn from "../middlewares/isLoggedIn.middleware.js";
import {
  signup,
  login,
  loggedInUserInfo,
  updateUserInfo,
  followUser,
  deactivateUser,
  getFollowers,
  getFollowings,
  unFollowUser,
} from "../controllers/user.controller.js";
import authorize from "../middlewares/authorize.js";
import {
  forgotPassword,
  updatePassword,
} from "../controllers/changePassword.controller.js";
import sendResponse from "../utils/response.util.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", updatePassword);

router.delete("/logout", isLoggedIn, (req, res) => {
  return sendResponse(res, "Logout successful", 200);
});

router.get("/loginUserInfo", isLoggedIn, loggedInUserInfo);
router.put("/updateUserInfo", isLoggedIn, updateUserInfo);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );

      const redirectUrl = `http://localhost:5173/google-success?token=${token}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      return res.redirect(
        "http://localhost:5173/login?error=something_went_wrong"
      );
    }
  }
);

router.put("/user/follow/:id", isLoggedIn, followUser);
router.put("/user/unfollow/:id", isLoggedIn, unFollowUser);
router.get("/user/followers", isLoggedIn, getFollowers);
router.get("/user/followings", isLoggedIn, getFollowings);

router.put("/user/deactivateUser", isLoggedIn, deactivateUser);

export default router;
