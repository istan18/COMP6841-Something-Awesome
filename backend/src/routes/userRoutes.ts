import express, { Request, Response } from "express";
import { registerUser, loginUser, sendVerificationCode, checkVerificationCode } from "../controllers/userControllers";
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
router.post("/verify/send", authenticateToken, checkTokenBlacklist, sendVerificationCode);
router.post("/verify/check", authenticateToken, checkTokenBlacklist, checkVerificationCode);
router.post("/signout", authenticateToken, checkTokenBlacklist, (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
        tokenBlacklist.add(token);
    }

    res.json({ message: "Successfully signed out" });
});

export default router;
