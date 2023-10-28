import express, { Request, Response } from "express";
import {
    registerUser,
    loginUser,
    sendMobileVerificationCode,
    checkMobileVerificationCode,
    sendEmailVerificationCode,
    checkEmailVerificationCode,
    getPasscode,
    setPasscode,
    verifyPasscode,
    sendForgotPassword,
    checkResetPassword,
} from "../controllers/userControllers";
import { authenticateToken, trackLoginAttempts } from "../middleware/authentication";

const tokenBlacklist: Set<string> = new Set();
const checkTokenBlacklist = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token revoked. Please log in again." });
    }

    next();
};

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", trackLoginAttempts, loginUser);
router.post("/verify/mobile/send", sendMobileVerificationCode);
router.post("/verify/mobile/check", checkMobileVerificationCode);
router.post("/verify/email/send", sendEmailVerificationCode);
router.post("/verify/email/check", checkEmailVerificationCode);
router.post("/signout", authenticateToken, checkTokenBlacklist, (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
        tokenBlacklist.add(token);
    }

    res.json({ message: "Successfully signed out" });
});
router.get("/passcode", authenticateToken, getPasscode);
router.post("/passcode", authenticateToken, setPasscode);
router.post("/passcode/verify", authenticateToken, verifyPasscode);
router.post("/reset-password", sendForgotPassword);
router.post("/reset-password/:token", checkResetPassword);

export default router;
