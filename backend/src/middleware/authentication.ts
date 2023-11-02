import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import bcrypt from "bcrypt";

export const verifyPassword = async (enteredPassword: string, realPassword: string): Promise<boolean> => {
    const validPassword = await bcrypt.compare(enteredPassword, realPassword);
    return validPassword;
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send("Access denied. Token not provided.");
    }

    jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: string | JwtPayload | undefined) => {
        if (err) {
            res.status(498).json({ error: "Invalid token" });
            return;
        }

        const user = await User.findById((decoded as JwtPayload).userId);
        if (!user) {
            res.status(400).json({ error: "Invalid id" });
            return;
        }

        req.user = user;
        next();
    });
};

export const trackLoginAttempts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            // Check if the account is currently locked
            if (user.userAuthentication.lockUntil && user.userAuthentication.lockUntil > new Date()) {
                return res.status(401).json({ error: "Account locked. Try again later.", locked: true });
            }

            const validPassword = await verifyPassword(password, user.password);

            if (!validPassword) {
                user.userAuthentication.loginAttempts += 1;

                if (user.userAuthentication.loginAttempts >= 5) {
                    // Lock the account for a duration (e.g., 30 minutes)
                    user.userAuthentication.lockUntil = new Date(Date.now() + 1 * 60 * 1000);
                }

                await user.save();
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
