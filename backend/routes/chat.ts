import express from "express";
import { handleSaveChat, handleChatCompletion } from "../controllers/chatController";

const router = express.Router();

router.post("/save", handleSaveChat);
router.post("/completions", handleChatCompletion);

export default router;
