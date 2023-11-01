import React, { useEffect, useState } from "react";
import * as Form from "@radix-ui/react-form";
import axios from "axios";
import Button from "./primitives/Button";
import Flex from "./primitives/Flex";
import { Input, FormField, FormRoot } from "./Form";
import { styled } from "@stitches/react";
interface VerifyProps {
    onVerify: (token: string) => void;
}

const VerifiedTitle = styled("div", {
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "1.5rem",
});

const InputContainer = styled(Flex, {
    gap: "0.4rem",
    marginLeft: "auto",
    marginRight: "auto",
});

const Verify: React.FC<VerifyProps> = ({ onVerify }) => {
    const [verifiedPhone, setVerifiedPhone] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState(false);
    const uId = localStorage.getItem("uId");

    const [verificationCode, setVerificationCode] = useState("");

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                if (!verifiedPhone && !verifiedEmail) {
                    if (isMounted) {
                        await sendVerification("mobile");
                    }
                } else if (!verifiedEmail && verifiedPhone) {
                    setVerificationCode("");
                    await sendVerification("email");
                }
            } catch (error) {
                console.error("Verification failed", error);
            }
        };
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [verifiedPhone, verifiedEmail]);

    const sendVerification = async (type: string) => {
        try {
            const response = await axios.post(`/users/verify/${type}/send`, { uId });
            console.log(response);
        } catch (error: any) {
            console.error("Send verification failed", error.response.data);
        }
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/users/verify/${type}/check`, {
                code: verificationCode,
                uId,
            });
            if (type === "mobile") {
                setVerifiedPhone(true);
            } else {
                setVerifiedEmail(true);
                onVerify(response.data.token);
                localStorage.setItem("token", response.data.token);
            }
        } catch (error: any) {
            console.error("Verify failed", error.response.data);
        }
    };
    return (
        <Flex
            css={{
                height: "calc(100% - 11.5rem)",
                boxSizing: "border-box",
                paddingTop: "1rem",
                width: "fit-content",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <FormRoot
                onSubmit={(e) => handleVerify(e, !verifiedPhone && !verifiedEmail ? "mobile" : "email")}
                css={{
                    display: "flex",
                    paddingTop: "3rem",
                    flexDirection: "column",
                    minWidth: 1000,
                    gap: "0.4rem",
                }}
            >
                {(!verifiedPhone && !verifiedEmail && (
                    <>
                        <VerifiedTitle>We sent a 6 digit verification code to your phone number.</VerifiedTitle>
                        <InputContainer>
                            <FormField
                                name="code"
                                css={{
                                    paddingTop: "2em",
                                    width: 150,
                                    textAlign: "center",
                                    marginBottom: "2em",
                                }}
                            >
                                <Form.Control asChild>
                                    <Input
                                        type="number"
                                        maxLength={6}
                                        css={{ MozAppearance: "textfield", WebkitAppearance: "none" }}
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                    />
                                </Form.Control>
                            </FormField>
                            <Form.Submit asChild>
                                <Button
                                    type="submit"
                                    css={{
                                        width: "fit-content",
                                        alignSelf: "center",
                                        padding: "0 1rem",
                                    }}
                                >
                                    Verify Phone
                                </Button>
                            </Form.Submit>
                            <Button
                                type="button"
                                css={{
                                    width: "fit-content",
                                    alignSelf: "center",
                                    padding: "0 1rem",
                                }}
                                onClick={() => sendVerification("mobile")}
                            >
                                Send code again
                            </Button>
                        </InputContainer>
                    </>
                )) ||
                    (verifiedPhone && !verifiedEmail && (
                        <>
                            <VerifiedTitle>
                                We also sent a 6 digit verification code to your email address.
                            </VerifiedTitle>
                            <InputContainer>
                                <FormField
                                    name="code"
                                    css={{
                                        paddingTop: "2em",
                                        width: 150,
                                        textAlign: "center",
                                        marginBottom: "2em",
                                    }}
                                >
                                    <Form.Control asChild>
                                        <Input
                                            type="number"
                                            maxLength={6}
                                            css={{ MozAppearance: "textfield", WebkitAppearance: "none" }}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                        />
                                    </Form.Control>
                                </FormField>
                                <Form.Submit asChild>
                                    <Button
                                        type="submit"
                                        css={{
                                            width: "fit-content",
                                            alignSelf: "center",
                                            padding: "0 1rem",
                                        }}
                                    >
                                        Verify email
                                    </Button>
                                </Form.Submit>
                                <Button
                                    type="button"
                                    css={{
                                        width: "fit-content",
                                        alignSelf: "center",
                                        padding: "0 1rem",
                                    }}
                                    onClick={() => sendVerification("email")}
                                >
                                    Send code again
                                </Button>
                            </InputContainer>
                        </>
                    )) ||
                    (verifiedEmail && <div>Account is verified</div>)}
            </FormRoot>
        </Flex>
    );
};

export default Verify;
