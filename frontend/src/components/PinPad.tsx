import React, { useState, useEffect } from "react";
import "./PinPad.css";
import { useGlobalState } from "../GlobalStateContext";
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
    setTimeoutId: (newTimeoutId: NodeJS.Timeout | null) => void;
    timeoutId: NodeJS.Timeout | null;
}

// passcode is the real passcode
// passcodeState is the passcode that is being entered
const Pinpad: React.FC<PasscodeProps> = ({ setPasscode, passcode, text, setTimeoutId, timeoutId }) => {
    const context = useGlobalState();
    const [passcodeState, setPasscodeState] = useState<PasscodeState>({ value: "", passCode: "------" });
    const pressButton = (number: string) => {
        if (parseInt(number) >= 0 && parseInt(number) <= 9) {
            setPasscodeState((prev) => ({
                value: prev.value + number,
                passCode: getPassCodeFromValue(prev.value + number),
            }));

            if (passcodeState.value.length + 1 === 6) {
                if (text === "Set PIN code") {
                    setPasscode(passcodeState.value + number);
                } else if (text === "Verify PIN code") {
                    if (passcodeState.value + number === passcode) {
                        save();
                    } else {
                        setPasscode(null);
                    }
                } else if (text === "Enter PIN") {
                    verifyPasscode(number);
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

    const verifyPasscode = async (number: string) => {
        try {
            const response = await axios.post(
                "/users/passcode/verify",
                { passcode: passcodeState.value + number },
                {
                    headers: {
                        Authorization: `Bearer ${context.globalState.token}`,
                    },
                },
            );
            if (response) {
                context.setGlobalState((prev) => ({
                    ...prev,
                    access: true,
                }));
                resetPasscodeTimeout(setTimeoutId, timeoutId, context);
            }
        } catch (error) {
            console.error("Verify passcode failed", error);
        }
    };

    const getPassCodeFromValue = (val: string): string => {
        let res = "";
        for (let i = 0; i < val.length; i++) {
            res += "*";
        }
        while (res.length < 6) {
            res += "-";
        }
        return res;
    };

    const save = async () => {
        try {
            const response = await axios.post(
                "/users/passcode",
                { passcode: passcodeState.value },
                {
                    headers: {
                        Authorization: `Bearer ${context.globalState.token}`,
                    },
                },
            );
            setPasscode(passcodeState.value);
            context.setGlobalState((prev) => ({
                ...prev,
                access: true,
            }));
            resetPasscodeTimeout(setTimeoutId, timeoutId, context);
            console.log(response);
        } catch (error) {
            console.error("Save passcode failed", error);
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
