import express from "express";
import { LocalController } from "../controllers";

const router = express.Router();

router.post("/signup", LocalController.signup);

export default router;
