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

const keyDerivationFunction = (password: string, salt: string): string => {
    const key = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 });
    return key.toString();
};

const verifyCaptcha = async (recaptchaValue: string): Promise<boolean> => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaValue}`;

    try {
        const response = await axios.post(verificationUrl);
        return response.data.success;
    } catch (error: any) {
        return false;
    }
};

export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password, email, firstName, lastName, phoneNumber, captcha } = req.body as RegisterRes;

        const existingEmailUser = await UserModel.findOne({ email });
        if (existingEmailUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        const existingUsernameUser = await UserModel.findOne({ username });
        if (existingUsernameUser) {
            return res.status(400).json({ error: "Username is already in use" });
        }

        const existingPhoneNumberUser = await UserModel.findOne({ phoneNumber });
        if (existingPhoneNumberUser) {
            return res.status(400).json({ error: "Phone number is already in use" });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = new UserModel({ username, password: hash, email, firstName, lastName, phoneNumber });
        await user.save();

        if (!verifyCaptcha(captcha)) {
            return res.status(401).json({ error: "Invalid captcha" });
        } else {
            const key = keyDerivationFunction(password, process.env.PASSWORD_GEN_KEY as string);
            return res
                .status(201)
                .json({ message: "User registered successfully", uId: user._id.toString(), locked: false, key });
        }
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password, captcha } = req.body;
        const user = await UserModel.findOne({ username });

        if (user == null) {
            return res.status(401).json({ error: "Invalid username or password", locked: false });
        }

        const isCorrect = await verifyPassword(password, user.password);
        if (!isCorrect) {
            return res.status(401).json({ error: "Invalid username or password", locked: false });
        }

        const isCaptchaValid = await verifyCaptcha(captcha);
        if (!isCaptchaValid) {
            return res.status(401).json({ error: "Invalid captcha", locked: false });
        }

        user.userAuthentication.loginAttempts = 0;
        user.userAuthentication.lockUntil = null;
        await user.save();
        const key = keyDerivationFunction(password, process.env.PASSWORD_GEN_KEY as string);
        return res.status(201).json({ message: "Login successful", uId: user._id.toString(), key, locked: false });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const sendMobileVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);

    const maxRetries = 3;
    const initialDelay = 1000; // 1 second
    let currentRetry = 0;

    const { uId } = req.body;

    try {
        const user = await UserModel.findById(uId);

        if (!user) {
            return res.status(400).json({ error: "Invalid id" });
        }

        const phoneNumber = user.phoneNumber;

        const sendVerificationCode = async () => {
            const verification = await twilioClient.verify.v2.services(serviceSid).verifications.create({
                to: phoneNumber as string,
                channel: "sms",
            });
            return res.status(201).json({ message: "Sent verification code", code: verification.sid });
        };

        const retryWithExponentialBackoff = async () => {
            try {
                await sendVerificationCode();
            } catch (err: any) {
                if (currentRetry < maxRetries) {
                    currentRetry++;
                    const delay = initialDelay * 2 ** currentRetry;
                    setTimeout(retryWithExponentialBackoff, delay);
                } else {
                    return res.status(500).json({ error: err.message });
                }
            }
        };

        await retryWithExponentialBackoff();
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const checkMobileVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID as string;
    const twilioClient = twilio(accountSid, authToken);

    const maxRetries = 3;
    const initialDelay = 1000; // 1 second
    let currentRetry = 0;

    try {
        const { code, uId } = req.body;
        const user = await UserModel.findById(uId);

        if (!user) {
            return res.status(400).json({ error: "Invalid id" });
        }

        const phoneNumber = user.phoneNumber;

        const verifyCodeWithRetry = async () => {
            try {
                const verificationCheck = await twilioClient.verify.v2.services(serviceSid).verificationChecks.create({
                    to: phoneNumber as string,
                    code,
                });

                if (verificationCheck.status === "approved") {
                    return res.status(201).json({ message: "Code verified successfully" });
                } else {
                    return res.status(401).json({ error: "Invalid code" });
                }
            } catch (err: any) {
                if (currentRetry < maxRetries) {
                    currentRetry++;
                    const delay = initialDelay * 2 ** currentRetry;
                    setTimeout(verifyCodeWithRetry, delay);
                } else {
                    return res.status(500).json({ error: err.message });
                }
            }
        };

        await verifyCodeWithRetry();
    } catch (err: any) {
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
        res.status(200).json({ message: "Code sent successfully" });
    });
};

export const checkEmailVerificationCode = async (req: Request, res: Response): Promise<any> => {
    const { uId, code } = req.body;
    const user = await UserModel.findById(uId);
    if (!user) {
        return res.status(400).json({ error: "Invalid id" });
    }

    const email = user.email;
    const correctCode = codeMap.get(email);

    if (!correctCode || parseInt(code) !== correctCode) {
        return res.status(401).json({ error: "Invalid code" });
    }

    codeMap.delete(email);

    const token = generateToken(user._id.toString());
    res.status(201).json({ message: "Code verified successfully", token });
};

export const getPasscode = async (req: Request, res: Response): Promise<any> => {
    const user = req.user;
    if (!user) {
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
        return res.status(400).json({ error: "Invalid id" });
    }

    const { passcode } = req.body;
    const username = user.username;

    const storedUser = await UserModel.findOne({ username });
    if (!storedUser) {
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
        return res.status(400).json({ error: "Invalid id" });
    }

    const storedUser = await UserModel.findOne({ username: user.username });
    if (!storedUser) {
        return res.status(400).json({ error: "Invalid id" });
    }

    if (!storedUser.passcode) {
        return res.status(401).json({ error: "No passcode set" });
    }

    const isCorrect = await verifyPassword(passcode, storedUser.passcode);
    if (!isCorrect) {
        return res.status(401).json({ error: "Invalid passcode" });
    }

    res.status(201).json({ message: "Passcode verified successfully" });
};

export const sendForgotPassword = async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ error: "User not found." });
    }

    const token = generateToken(user._id.toString());
    const storedUser = await UserModel.findOne({ email });

    if (!storedUser) {
        return res.status(404).json({ error: "User not found." });
    }
    storedUser.userAuthentication.resetToken = token;
    storedUser.userAuthentication.resetTokenExpires = new Date(Date.now() + 3600000);
    await storedUser.save();

    try {
        await sendResetEmail(email, token);
        res.json({ message: "Reset email sent successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to send reset email" });
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
    let resetLink: string | null = null;
    if (process.env.NODE_ENV === "production") {
        const prodLink = process.env.APP_URL_PROD;
        resetLink = `${prodLink}/reset/${token}`;
    } else {
        const devLink = process.env.APP_URL_DEV;
        const port = process.env.FRONTEND_PORT || 3000;
        resetLink = `${devLink}:${port}/reset/${token}`;
    }
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
    const storedUser = await UserModel.findOne({
        "userAuthentication.resetToken": token,
        "userAuthentication.resetTokenExpires": { $gt: Date.now() },
    });

    if (!storedUser) {
        return res.status(400).json({ error: "Invalid or expired token." });
    }
    storedUser.password = await bcrypt.hash(password, 10);
    storedUser.userAuthentication.resetToken = null;
    storedUser.userAuthentication.resetTokenExpires = null;
    await storedUser.save();
    return res.json({ message: "Password reset successfully." });
};
