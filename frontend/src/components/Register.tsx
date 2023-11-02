import * as Form from "@radix-ui/react-form";
import { styled } from "@stitches/react";
import Button from "./primitives/Button";
import Flex from "./primitives/Flex";
import { FormField, FormRoot, Input } from "./Form";
import axios from "axios";
import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import parsePhoneNumberFromString from "libphonenumber-js";
import validator from "validator";
import { getPasswordStrength, handleGeneratePassword, getPasswordColor } from "../utils";

import { useNavigate } from "react-router-dom";
const NameContainer = styled(Flex, {});

const PasswordContainer = styled(Flex, {});

const RegisterTitle = styled("div", {
    marginLeft: "auto",
    fontSize: "2rem",
});

interface RegisterProps {
    onRegister: (uId: string, key: string) => void;
}

function isValidPhoneNumber(phoneNumber: string) {
    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, "AU");
    return parsedPhoneNumber && parsedPhoneNumber.isValid();
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [captcha, setCaptcha] = useState<string | null>();
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (username.length < 5) {
                alert("Username is too short");
                return;
            } else if (getPasswordStrength(password) !== "good" && getPasswordStrength(password) !== "strong") {
                alert("Password is not secure enough");
                return;
            } else if (!validator.isEmail(email)) {
                alert("Invalid email inputted");
                return;
            } else if (!isValidPhoneNumber(phoneNumber)) {
                alert("Phone number is invalid");
                return;
            } else if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }
            const response = await axios.post("/users/register", {
                firstName,
                lastName,
                email,
                phoneNumber,
                username,
                password,
                captcha,
            });
            onRegister(response.data.uId, response.data.key);
        } catch (error) {
            alert("Registration failed:" + error);
        }
    };
    return (
        <Flex
            css={{
                height: "calc(100% - 11.5rem)",
                boxSizing: "border-box",
                paddingTop: "3rem",
                gap: "3rem",
                width: 700,
                margin: "auto",
            }}
        >
            <Flex css={{ flexDirection: "column", gap: "1rem" }}>
                <RegisterTitle>Register</RegisterTitle>
                <div style={{ fontSize: "1rem" }}>Sign up for an account.</div>
            </Flex>
            <FormRoot
                onSubmit={handleSubmit}
                css={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 400,
                    gap: "0.4rem",
                }}
            >
                <NameContainer>
                    <FormField name="first-name" css={{ width: 190 }}>
                        <Form.Control asChild>
                            <Input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First Name"
                            />
                        </Form.Control>
                    </FormField>

                    <FormField name="last-name" css={{ marginLeft: "auto", width: 190 }}>
                        <Form.Control asChild>
                            <Input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last Name"
                            />
                        </Form.Control>
                    </FormField>
                </NameContainer>

                <FormField name="email">
                    <Form.Control asChild>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </Form.Control>
                </FormField>

                <FormField name="phone-number">
                    <Form.Control asChild>
                        <Input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Phone Number"
                        />
                    </Form.Control>
                </FormField>

                <FormField name="username">
                    <Form.Control asChild>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                        />
                    </Form.Control>
                </FormField>

                <PasswordContainer>
                    <FormField name="password">
                        <Form.Control asChild>
                            <Input
                                type="password"
                                value={password}
                                css={{ border: password.length > 0 ? "2px solid " + getPasswordColor(password) : "" }}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </Form.Control>
                    </FormField>
                    <Button
                        type="button"
                        css={{ width: "fit-content", marginLeft: "auto" }}
                        onClick={(e) => handleGeneratePassword(e, setPassword)}
                    >
                        Generate Password
                    </Button>
                </PasswordContainer>

                <FormField name="confirm">
                    <Form.Control asChild>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                        />
                    </Form.Control>
                </FormField>
                <ReCAPTCHA
                    sitekey="6LdporEoAAAAAP336VV1NAYb1tiX90Fl5NZU9oQm"
                    onChange={(value) => setCaptcha(value as string)}
                    style={{ alignSelf: "center" }}
                />
                <Form.Submit asChild>
                    <Button
                        type="submit"
                        css={{
                            marginTop: 10,
                            width: "fit-content",
                            alignSelf: "center",
                            padding: "0 2rem",
                        }}
                    >
                        Register
                    </Button>
                </Form.Submit>
                <Button
                    type="button"
                    css={{
                        width: "fit-content",
                        alignSelf: "center",
                        marginTop: "1rem",
                        background: "transparent",
                        border: "1px solid white",
                        padding: "0 2rem",
                        "&:hover": {
                            backgroundColor: "white",
                            color: "black",
                        },
                    }}
                    onClick={() => navigate("/login")}
                >
                    Have an account? Log in
                </Button>
            </FormRoot>
        </Flex>
    );
};

export default Register;
