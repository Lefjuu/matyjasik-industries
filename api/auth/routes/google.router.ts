import express from "express";
import { GoogleController } from "../controllers";

const router = express.Router();

router.get("/google", GoogleController.index);
router.get("/google/callback", GoogleController.callback);

export default router;
