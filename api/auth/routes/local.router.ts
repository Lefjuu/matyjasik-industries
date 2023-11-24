import express from "express";
import { LocalController } from "../controllers";
import { mw } from "../services/mw.service";

const router = express.Router();

router.post("/signup", LocalController.signup);
router.post("/login", LocalController.login);
router.post("/verify", LocalController.verify);
router.get("/refresh", LocalController.refresh);
router.get("/me", mw(), LocalController.me);

export default router;
