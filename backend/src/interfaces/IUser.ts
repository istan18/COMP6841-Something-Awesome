import { Item } from "./Item";

export interface IUser extends Document {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passcode: string | null;
    userAuthentication: UserAuthentication;
    items: Array<Item>;
}

export interface UserAuthentication {
    loginAttempts: number;
    lockUntil: Date | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
}
