interface IUser extends Document {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    loginAttempts: number;
    lockUntil: Date | null;
    passcode: string | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
}

export default IUser;
