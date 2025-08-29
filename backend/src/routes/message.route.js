import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar,getMessages,sendMessage } from "../controllers/message.controller.js";

const router =express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id([a-zA-Z0-9]+)", protectRoute, getMessages);
router.post("/send/:id([a-zA-Z0-9]+)", protectRoute, sendMessage);

export default router;