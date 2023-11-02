import secureRandomPassword from "secure-random-password";

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
            alert("Could not copy password to clipboard: " + err);
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
    timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | null>,
    setAccess: (access: boolean) => void,
) => {
    if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
    }

    const newTimeoutId = setTimeout(() => {
        setAccess(false);
    }, 1 * 60 * 1000);

    timeoutIdRef.current = newTimeoutId;
};

export const fileToDataUrl = (file: File | null) => {
    if (!file) return new Promise((resolve) => resolve(null));
    const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    const valid = validFileTypes.find((type) => type === file.type);
    if (!valid) {
        throw Error("provided file is not a png, jpg or jpeg image.");
    }
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
};
