import { type Request, type Response } from "express";
import UserModel from "../models/userModel";
import { verifyPassword } from "../middleware/authentication";
import jwt from "jsonwebtoken";
import axios from "axios";
import twilio from "twilio";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";

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
        console.log("hi");
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

        const hash = await bcrypt.hash(password, 10);
        const user = new UserModel({ username, password: hash, email, firstName, lastName, phoneNumber });
        await user.save();

        if (!verifyCaptcha(captcha)) {
            console.log("Invalid captcha");
            return res.status(401).json({ error: "Invalid captcha" });
        } else {
            console.log("Valid captcha");
            const key = CryptoJS.AES.encrypt(password, process.env.PASSWORD_GEN_KEY as string).toString();
            return res
                .status(201)
                .json({ message: "User registered successfully", uId: user._id.toString(), locked: false, key });
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

        user.userAuthentication.loginAttempts = 0;
        user.userAuthentication.lockUntil = null;
        await user.save();
        console.log("Login successful");
        const key = CryptoJS.AES.encrypt(password, process.env.PASSWORD_GEN_KEY as string).toString();
        return res.status(201).json({ message: "Login successful", uId: user._id.toString(), key, locked: false });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

export const sendMobileVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);
    try {
        const { uId } = req.body;
        const user = await UserModel.findById(uId);
        if (!user) {
            console.log("Invalid id");
            return res.status(400).json({ error: "Invalid id" });
        }

        const phoneNumber = user.phoneNumber;

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

export const checkMobileVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);
    try {
        const { code, uId } = req.body;
        const user = await UserModel.findById(uId);
        if (!user) {
            console.log("Invalid id");
            return res.status(400).json({ error: "Invalid id" });
        }

        const phoneNumber = user.phoneNumber;
        const verificationCheck = await twilioClient.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber as string,
            code,
        });

        if (verificationCheck.status === "approved") {
            console.log("Code verified successfully");
            return res.status(201).json({ message: "Code verified successfully" });
        } else {
            console.log("Invalid code");
            return res.status(401).json({ error: "Invalid code" });
        }
    } catch (err: any) {
        console.error("Error checking verification code:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

const codeMap = new Map();

export const sendEmailVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const emailPassword = process.env.EMAIL_PASSWORD;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "chriscla2003@gmail.com",
            pass: emailPassword,
        },
    });
    const { uId } = req.body;
    const user = await UserModel.findById(uId);
    if (!user) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }
    const email = user.email;
    const code = Math.floor(100000 + Math.random() * 900000);
    codeMap.set(email, code);
    const mailOptions = {
        from: "chriscla2003@gmail.com",
        to: email,
        subject: "Your code for 2FA - PWManager",
        text: `Your code is: ${code}`,
    };

    setTimeout(() => {
        codeMap.delete(email);
    }, 60000);

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        console.log("Email code verified successfully");
        res.status(200).json({ message: "Code sent successfully" });
    });
};

export const checkEmailVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const { uId, code } = req.body;
    const user = await UserModel.findById(uId);
    if (!user) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    const email = user.email;
    const correctCode = codeMap.get(email);

    if (!correctCode || parseInt(code) !== correctCode) {
        return res.status(401).json({ error: "Invalid code" });
    }

    codeMap.delete(email);

    const token = generateToken(user._id.toString());
    console.log("Email code verified successfully");
    res.status(201).json({ message: "Code verified successfully", token });
};

export const getPasscode = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    if (!user) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    const passcode = user.passcode;

    if (!passcode) {
        return res.status(401).json({ error: "No passcode set" });
    }

    return res.status(200).json({ passcode });
};

export const setPasscode = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    if (!user) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    const { passcode } = req.body;
    const username = user.username;

    const storedUser = await UserModel.findOne({ username });
    if (!storedUser) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    const hashedPasscode = await bcrypt.hash(passcode, 10);
    storedUser.passcode = hashedPasscode;
    await storedUser.save();

    return res.status(201).json({ message: "Passcode set successfully" });
};

export const verifyPasscode = async (req: Request, res: Response): Promise<any> => {
    const { passcode } = req.body;
    const user = req.user;
    if (!user) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        console.log("Invalid id");
        return res.status(400).json({ error: "Invalid id" });
    }

    if (!storedUser.passcode) {
        console.log("No passcode set");
        return res.status(401).json({ error: "No passcode set" });
    }

    const isCorrect = await verifyPassword(passcode, storedUser.passcode);
    console.log(passcode, storedUser.passcode);
    if (!isCorrect) {
        console.log("Invalid passcode");
        return res.status(401).json({ error: "Invalid passcode" });
    }

    res.status(201).json({ message: "Passcode verified successfully" });
};

export const sendForgotPassword = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    // Check if the email exists in your database
    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    // Generate and store a reset token
    const token = generateToken(user._id.toString());
    await UserModel.updateOne({ email }, { $set: { resetToken: token, resetTokenExpires: Date.now() + 3600000 } });

    // Send reset email
    try {
        await sendResetEmail(email, token);
        res.json({ message: "Reset email sent successfully." });
    } catch (error) {
        console.error("Error sending reset email", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const sendResetEmail = async (email: string, token: string) => {
    const emailPassword = process.env.EMAIL_PASSWORD;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "chriscla2003@gmail.com",
            pass: emailPassword,
        },
    });

    const resetLink = `http://your-app.com/reset-password/${token}`;

    const mailOptions = {
        from: "chriscla2003@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: ${resetLink}`,
    };

    return transporter.sendMail(mailOptions);
};

export const checkResetPassword = async (req: Request, res: Response): Promise<any> => {
    const { token } = req.params;
    const { password } = req.body;

    // Check if the token is valid
    const user = await UserModel.findOne({ resetToken: token, resetTokenExpires: { $gt: Date.now() } });

    if (!user) {
        return res.status(400).json({ error: "Invalid or expired token." });
    }
    // Update the password and clear the reset token
    await UserModel.updateOne({ _id: user._id }, { $set: { password, resetToken: null, resetTokenExpires: null } });
    return res.json({ message: "Password reset successfully." });
};
