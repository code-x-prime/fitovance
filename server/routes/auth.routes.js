import express from "express";
import {
  googleAuthRedirect, googleAuthCallback,
  facebookAuthRedirect, facebookAuthCallback,
  twitterAuthRedirect, twitterAuthCallback,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

router.get("/facebook", facebookAuthRedirect);
router.get("/facebook/callback", facebookAuthCallback);

router.get("/twitter", twitterAuthRedirect);
router.get("/twitter/callback", twitterAuthCallback);

export default router;
