import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import bcrypt from "bcrypt";

export const verifyPassword = async (enteredPassword: string, realPassword: string): Promise<boolean> => {
    const validPassword = await bcrypt.compare(enteredPassword, realPassword);
    console.log(validPassword);
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
            console.log("token is invalid");
            res.status(403).json({ error: "Invalid token" });
            return;
        }

        const user = await User.findById((decoded as JwtPayload).userId);
        if (!user) {
            console.log("Invalid id");
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
            if (user.lockUntil && user.lockUntil > new Date()) {
                console.log("Account locked");
                return res.status(401).json({ error: "Account locked. Try again later.", locked: true });
            }

            const validPassword = await verifyPassword(password, user.password);

            if (!validPassword) {
                console.log(user.loginAttempts);
                user.loginAttempts += 1;

                if (user.loginAttempts >= 5) {
                    // Lock the account for a duration (e.g., 30 minutes)
                    user.lockUntil = new Date(Date.now() + 1 * 60 * 1000);
                }

                await user.save();
            }
        }

        next();
    } catch (error) {
        console.error("Error tracking login attempts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
