import { type Request, type Response } from "express";
import UserModel from "../models/userModel";
import { verifyPassword } from "../middleware/authentication";
import jwt from "jsonwebtoken";
import axios from "axios";
import twilio from "twilio";

const generateToken = (userId: string): string => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "1h" });
    return token;
};

interface RegisterRes {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    captcha: string;
}

const verifyCaptcha = async (recaptchaValue: string): Promise<boolean> => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaValue}`;

    try {
        const response = await axios.post(verificationUrl);
        return response.data.success;
    } catch (error: any) {
        console.error("reCAPTCHA verification failed:", error.message);
        return false;
    }
};

export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password, email, firstName, lastName, phoneNumber, captcha } = req.body as RegisterRes;

        const existingEmailUser = await UserModel.findOne({ email });
        if (existingEmailUser) {
            console.log("Email is already in use");
            return res.status(400).json({ error: "Email is already in use" });
        }

        const existingUsernameUser = await UserModel.findOne({ username });
        if (existingUsernameUser) {
            console.log("Username is already in use");
            return res.status(400).json({ error: "Username is already in use" });
        }

        const existingPhoneNumberUser = await UserModel.findOne({ phoneNumber });
        if (existingPhoneNumberUser) {
            console.log("Phone number is already in use");
            return res.status(400).json({ error: "Phone number is already in use" });
        }

        const user = new UserModel({ username, password, email, firstName, lastName, phoneNumber });
        await user.save();
        const token = generateToken(user._id.toString());

        if (!verifyCaptcha(captcha)) {
            console.log("Invalid captcha");
            return res.status(401).json({ error: "Invalid captcha" });
        } else {
            console.log("Valid captcha");
            return res.status(201).json({ message: "User registered successfully", token });
        }
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password, captcha } = req.body;
        const user = await UserModel.findOne({ username });

        if (user == null) {
            console.log("Invalid username or password");
            return res.status(401).json({ error: "Invalid username or password", locked: false });
        }

        const isCorrect = await verifyPassword(password, user.password);
        if (!isCorrect) {
            console.log("Invalid username or password");
            return res.status(401).json({ error: "Invalid username or password", locked: false });
        }

        const isCaptchaValid = await verifyCaptcha(captcha);
        if (!isCaptchaValid) {
            console.log("Invalid captcha");
            return res.status(401).json({ error: "Invalid captcha", locked: false });
        }

        const token = generateToken(user._id.toString());
        console.log("Login successful");
        return res.status(201).json({ message: "Login successful", token, locked: false });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const sendVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);
    try {
        const phoneNumber = req.user && req.user.phoneNumber;
        const verification = await twilioClient.verify.v2.services(serviceSid).verifications.create({
            to: phoneNumber as string,
            channel: "sms",
        });

        console.log("Sent verification code");
        return res.status(201).json({ message: "Sent verification code", code: verification.sid });
    } catch (err: any) {
        console.log("Error sending verification code:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

export const checkVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);
    try {
        const { code } = req.body;
        const phoneNumber = req.user && req.user.phoneNumber;
        const verificationCheck = await twilioClient.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber as string,
            code,
        });

        if (verificationCheck.status === "approved") {
            return res.status(201).json({ message: "Verification code approved" });
        }
    } catch (err: any) {
        console.error("Error checking verification code:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
