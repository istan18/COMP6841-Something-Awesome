import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import type IUser from "../interfaces/IUser";

const userSchema = new Schema<IUser>({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
});

userSchema.pre("save", async function (next) {
    const user = this as IUser;
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
