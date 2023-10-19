interface IUser extends Document {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    loginAttempts: number;
    lockUntil: Date | null;
}

export default IUser;
