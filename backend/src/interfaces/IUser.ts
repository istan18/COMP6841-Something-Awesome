export interface IUser extends Document {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    passcode: string | null;
    userAuthentication: UserAuthentication;
}

export interface UserAuthentication {
    loginAttempts: number;
    lockUntil: Date | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
}
