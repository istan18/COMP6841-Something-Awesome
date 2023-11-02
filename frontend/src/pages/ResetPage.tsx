import axios from "axios";
import * as Form from "@radix-ui/react-form";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPasswordColor, getPasswordStrength, handleGeneratePassword } from "../utils";
import Flex from "../components/primitives/Flex";
import { FormField, FormRoot, Input } from "../components/Form";
import Button from "../components/primitives/Button";
import { styled } from "@stitches/react";

const PasswordContainer = styled(Flex, {
    gap: "1rem",
});

const ResetPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const params = useParams();
    const token = params.token;

    const handleSendReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(axios.defaults.baseURL);
        console.log("sending", email);
        try {
            await axios.post("/users/reset", {
                email,
            });
        } catch (error) {
            alert(error);
        }
        alert("If the email is valid, check it for the reset link");
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(password);
        console.log(getPasswordStrength(password));
        if (getPasswordStrength(password) !== "good" && getPasswordStrength(password) != "strong") {
            alert("Password is not secure enough");
            return;
        } else if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await axios.post(`/users/reset/${token}`, {
                password,
            });
            alert("Password reset successful");
            navigate("/login");
        } catch (error) {
            alert(error);
        }
    };
    return !token ? (
        <div
            style={{
                height: "calc(100% - 11.5rem)",
                boxSizing: "border-box",
                paddingTop: "3rem",
                width: 200,
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <FormRoot
                onSubmit={handleSendReset}
                css={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 400,
                    gap: "0.4rem",
                }}
            >
                <label style={{ fontSize: "1rem " }}>
                    Enter email:
                    <FormField name="email" css={{ paddingTop: "1rem", width: 200 }}>
                        <Form.Control asChild>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                            />
                        </Form.Control>
                    </FormField>
                    <Form.Submit asChild>
                        <Button
                            type="submit"
                            css={{
                                marginTop: 10,
                                marginLeft: "2.75rem",
                                width: "fit-content",
                                alignSelf: "center",
                                padding: "0 2rem",
                            }}
                        >
                            Reset
                        </Button>
                    </Form.Submit>
                </label>
            </FormRoot>
        </div>
    ) : (
        <Flex
            css={{
                height: "calc(100% - 11.5rem)",
                boxSizing: "border-box",
                paddingTop: "3rem",
                width: 400,
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            <FormRoot
                onSubmit={handleResetPassword}
                css={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 450,
                    gap: "0.4rem",
                }}
            >
                <label style={{ fontSize: "1rem" }}>
                    Password:
                    <PasswordContainer>
                        <FormField
                            name="password"
                            css={{
                                paddingTop: "0.5rem",
                                width: 400,
                            }}
                        >
                            <Form.Control asChild>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    css={{ outlineColor: getPasswordColor(password) }}
                                />
                            </Form.Control>
                        </FormField>
                        <Button
                            type="button"
                            css={{
                                fontSize: "1rem",
                                width: "75%",
                                alignSelf: "center",
                                textAlign: "center",
                            }}
                            onClick={(e) => handleGeneratePassword(e, setPassword)}
                        >
                            Generate password
                        </Button>
                    </PasswordContainer>
                </label>
                <label style={{ marginLeft: "auto", marginRight: "auto" }}>
                    Confirm Password:
                    <FormField
                        name="confirm"
                        css={{ width: 225, paddingTop: "0.5rem", marginRight: "auto", marginLeft: "auto" }}
                    >
                        <Form.Control asChild>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Password"
                            />
                        </Form.Control>
                    </FormField>
                </label>
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
                        Reset Password
                    </Button>
                </Form.Submit>
            </FormRoot>
        </Flex>
    );
};

export default ResetPage;
