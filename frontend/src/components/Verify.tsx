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
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const uId = localStorage.getItem("uId");

    const [verificationCode, setVerificationCode] = useState("");
    const [verifiedPhone, setVerifiedPhone] = useState(false);

    const sendVerification = async (type: string) => {
        if (!buttonDisabled) {
            try {
                await axios.post(`/users/verify/${type}/send`, { uId });
            } catch (error: any) {
                alert(error.response.data);
            }
        }
    };

    const resend = async (type: string) => {
        await sendVerification(type);
        setButtonDisabled(true);

        setTimeout(() => {
            setButtonDisabled(false);
        }, 30000);
    };

    const fetchData = async (sending: string) => {
        setVerificationCode("");
        await sendVerification(sending);
    };

    useEffect(() => {
        fetchData("mobile");
    }, []);

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
        e.preventDefault();
        try {
            const response = await axios.post(`/users/verify/${type}/check`, {
                code: verificationCode,
                uId,
            });
            if (type === "mobile") {
                setVerifiedPhone(true);
                await fetchData("email");
            } else {
                onVerify(response.data.token);
                localStorage.setItem("token", response.data.token);
            }
        } catch (error: any) {
            alert(error);
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
                onSubmit={(e) => handleVerify(e, !verifiedPhone ? "mobile" : "email")}
                css={{
                    display: "flex",
                    paddingTop: "3rem",
                    flexDirection: "column",
                    minWidth: 1000,
                    gap: "0.4rem",
                }}
            >
                {(!verifiedPhone && (
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
                                disabled={buttonDisabled}
                                type="button"
                                css={{
                                    width: "fit-content",
                                    alignSelf: "center",
                                    padding: "0 1rem",
                                }}
                                onClick={() => resend("mobile")}
                            >
                                Send code again
                            </Button>
                        </InputContainer>
                    </>
                )) ||
                    (verifiedPhone && (
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
                                    disabled={buttonDisabled}
                                    type="button"
                                    css={{
                                        width: "fit-content",
                                        alignSelf: "center",
                                        padding: "0 1rem",
                                    }}
                                    onClick={() => resend("email")}
                                >
                                    Send code again
                                </Button>
                            </InputContainer>
                        </>
                    )) || <div>Account is verified</div>}
            </FormRoot>
        </Flex>
    );
};

export default Verify;
