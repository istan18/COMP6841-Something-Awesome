import React, { useState } from "react";
import * as Form from "@radix-ui/react-form";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import Flex from "./primitives/Flex";
import { useNavigate } from "react-router-dom";
import { styled } from "@stitches/react";
import { FormField, FormRoot, Input } from "./Form";
import Button from "./primitives/Button";

interface LoginProps {
    onLogin: (uId: string, key: string) => void;
}

const LoginTitle = styled("div", {
    fontSize: "2rem",
});

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [captcha, setCaptcha] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("/users/login", {
                username,
                password,
                captcha,
            });
            onLogin(response.data.uId, response.data.key);
        } catch (error: any) {
            console.error("Login failed", error.response.data);
            if (error.response.data.locked) {
                alert("Your account has been locked, please try again later");
            }
        }
    };

    return (
        <Flex
            css={{
                height: "calc(100% - 11.5rem)",
                boxSizing: "border-box",
                paddingTop: "3rem",
                gap: "0.1rem",
                width: 500,
                margin: "auto",
            }}
        >
            <LoginTitle>Login</LoginTitle>
            <FormRoot
                onSubmit={handleLogin}
                css={{
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 400,
                    gap: "0.1rem",
                }}
            >
                <FormField name="username" css={{ alignSelf: "center", width: 300 }}>
                    <Form.Control asChild>
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                        />
                    </Form.Control>
                </FormField>

                <FormField name="password" css={{ alignSelf: "center", width: 300 }}>
                    <Form.Control asChild>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
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
                        Login
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
                    onClick={() => navigate("/register")}
                >
                    Don&rsquo;t have an account? Register
                </Button>
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
                    onClick={() => navigate("/reset")}
                >
                    Forgot password?
                </Button>
            </FormRoot>
        </Flex>
    );
};

export default Login;
