import React, { useState, useEffect } from "react";
import "./PinPad.css";
import axios from "axios";
import { resetPasscodeTimeout } from "../utils";

interface PasscodeState {
    value: string;
    passCode: string;
}

interface PasscodeProps {
    setPasscode: (passcode: string | null) => void;
    text: string;
    passcode: string | null;
    setHasPasscode: (hasPasscode: boolean) => void;
    setAccess: (access: boolean) => void;
    timeoutIdRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

// Code taken and tranformed from https://codesandbox.io/s/pin-pad-6rz5y?file=/src/PinPad.js

const Pinpad: React.FC<PasscodeProps> = ({ setHasPasscode, setPasscode, passcode, text, timeoutIdRef, setAccess }) => {
    const token = localStorage.getItem("token");
    const [passcodeState, setPasscodeState] = useState<PasscodeState>({ value: "", passCode: "------" });
    const pressButton = (number: string) => {
        if (parseInt(number) >= 0 && parseInt(number) <= 9) {
            setPasscodeState((prev) => ({
                value: prev.value + number,
                passCode: getPassCodeFromValue(prev.value + number),
            }));

            if (passcodeState.value.length + 1 === 6) {
                const enteredPasscode = passcodeState.value + number;
                if (text === "Set PIN code") {
                    setPasscode(enteredPasscode);
                } else if (text === "Verify PIN code") {
                    if (passcodeState.value + number === passcode) {
                        save(enteredPasscode);
                    } else {
                        setPasscode(null);
                    }
                } else if (text === "Enter PIN") {
                    verifyPasscode(enteredPasscode);
                }
                clear();
            }
        } else if (number === "Backspace") {
            setPasscodeState((prev) => ({
                value: prev.value.slice(0, -1),
                passCode: getPassCodeFromValue(prev.value.slice(0, -1)),
            }));
        }
    };

    const verifyPasscode = async (enteredPasscode: string) => {
        try {
            const response = await axios.post(
                "/users/passcode/verify",
                { passcode: enteredPasscode },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setHasPasscode(true);
            if (response) {
                setAccess(true);
                resetPasscodeTimeout(timeoutIdRef, setAccess);
            }
        } catch (error) {
            alert(error);
        }
    };

    const getPassCodeFromValue = (val: string): string =>
        "*".repeat(Math.min(val.length, 6)) + "-".repeat(Math.max(0, 6 - val.length));

    const save = async (enteredPasscode: string) => {
        try {
            const response = await axios.post(
                "/users/passcode",
                { passcode: enteredPasscode },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (response) {
                setPasscode(enteredPasscode);
                setAccess(true);
                setHasPasscode(true);
                resetPasscodeTimeout(timeoutIdRef, setAccess);
            }
        } catch (error) {
            alert(error);
        }
    };

    const clear = () => {
        setPasscodeState({
            value: "",
            passCode: getPassCodeFromValue(""),
        });
    };

    useEffect(() => {
        const handleKeyUp = (event: KeyboardEvent) => {
            pressButton(event.key);
        };

        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, [passcodeState.value]);

    return (
        <div className="pin-pad-main-container">
            <div className="pin-pad-container">
                <div className="pin-pad-top">
                    <div>{text}</div>
                    <div className="pin-pad-circle-container">{passcodeState.passCode}</div>
                </div>
                <div className="pin-pad-middle">
                    <div className="pin-pad-number-container">
                        <div className="pin-pad-number-row">
                            {[1, 2, 3].map((num) => (
                                <div
                                    className="pin-pad-number-cell"
                                    key={num}
                                    onClick={() => pressButton(num.toString())}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                        <div className="pin-pad-number-row">
                            {[4, 5, 6].map((num) => (
                                <div
                                    className="pin-pad-number-cell"
                                    key={num}
                                    onClick={() => pressButton(num.toString())}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                        <div className="pin-pad-number-row">
                            {[7, 8, 9].map((num) => (
                                <div
                                    className="pin-pad-number-cell"
                                    key={num}
                                    onClick={() => pressButton(num.toString())}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                        <div className="pin-pad-number-row">
                            <div className="pin-pad-number-cell pin-pad-hide"></div>
                            <div className="pin-pad-number-cell" onClick={() => pressButton("0")}>
                                0
                            </div>
                            <div className="pin-pad-number-cell pin-pad-hide"></div>
                        </div>
                    </div>
                </div>
                <div className="pin-pad-bottom" onClick={clear}>
                    Clear
                </div>
            </div>
        </div>
    );
};

export default Pinpad;
