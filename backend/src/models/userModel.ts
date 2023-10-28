import mongoose, { Schema } from "mongoose";
import type IUser from "../interfaces/IUser";

const userSchema = new Schema<IUser>({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 8 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passcode: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
