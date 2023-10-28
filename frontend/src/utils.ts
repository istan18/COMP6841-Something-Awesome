import secureRandomPassword from "secure-random-password";
import { GlobalStateContextValue } from "./GlobalStateContext";

export const generateRandomPassword = () => {
    const password = secureRandomPassword.randomPassword({
        length: 14,
        characters:
            secureRandomPassword.lower +
            secureRandomPassword.upper +
            secureRandomPassword.digits +
            secureRandomPassword.symbols,
    });

    return password;
};

export const getPasswordStrength = (password: string) => {
    // Define your password strength criteria
    const lengthCriteria = password.length >= 8;
    const lowercaseCriteria = /[a-z].*[a-z]/.test(password);
    const uppercaseCriteria = /[A-Z].*[A-Z]/.test(password);
    const numberCriteria = /\d/.test(password);
    const specialCharCriteria = /[!@#$%^&*()_+{}\\[\]:;<>,.?~\\/-]/.test(password);

    // Evaluate the password strength based on criteria
    if (!lengthCriteria) {
        return "invalid";
    } else if (lengthCriteria && (!lowercaseCriteria || !uppercaseCriteria || !numberCriteria)) {
        return "weak";
    } else if (lengthCriteria && lowercaseCriteria && uppercaseCriteria && numberCriteria && !specialCharCriteria) {
        return "good";
    } else {
        return "strong";
    }
};

export const handleGeneratePassword = (
    e: React.MouseEvent<HTMLButtonElement>,
    setPassword: (password: string) => void,
) => {
    let newPassword = generateRandomPassword();

    // Ensure the generated password meets the strong criteria
    while (getPasswordStrength(newPassword) !== "strong") {
        newPassword = generateRandomPassword();
    }

    setPassword(newPassword);

    navigator.clipboard.writeText(newPassword).then(
        () => {
            alert("Password: " + newPassword + " has been copied to clipboard");
        },
        (err) => {
            console.error("Could not copy text: ", err);
        },
    );
};

export const getPasswordColor = (password: string) => {
    const strength = getPasswordStrength(password);
    switch (strength) {
        case "invalid":
            return "red";
        case "weak":
            return "yellow";
        case "good":
            return "green";
        case "strong":
            return "darkgreen";
        default:
            return "black";
    }
};

export const resetPasscodeTimeout = (
    setTimeoutId: (newTimeoutId: NodeJS.Timeout | null) => void,
    timeoutId: NodeJS.Timeout | null,
    context: GlobalStateContextValue,
) => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
        context.setGlobalState((prev) => ({
            ...prev,
            token: null,
            access: false,
        }));
    }, 1 * 60 * 1000); // 10 minutes in milliseconds

    setTimeoutId(newTimeoutId);
};
