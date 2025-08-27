import express from "express";
import { login, logout, signup ,updateprofile,checkauth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router =express.Router();
//to go to login or register
router.post("/signup",signup);

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile",protectRoute,updateprofile); //protectRoute checks if user is authenticated 

router.get("/check",protectRoute,checkauth);

export default router;