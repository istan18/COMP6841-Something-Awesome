import mongoose, { Schema } from "mongoose";
import type { IUser, UserAuthentication } from "../interfaces/IUser";
import ItemSchema from "./itemsModel";

const userAuthenticationSchema = new Schema<UserAuthentication>({
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
});

const userSchema = new Schema<IUser>({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: 8 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    passcode: { type: String, default: null },
    email: { type: String, required: true },
    userAuthentication: {
        type: userAuthenticationSchema,
        default: {
            loginAttempts: 0,
            lockUntil: null,
            resetToken: null,
            resetTokenExpires: null,
        },
    },
    items: { type: [ItemSchema], default: [] },
});

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
