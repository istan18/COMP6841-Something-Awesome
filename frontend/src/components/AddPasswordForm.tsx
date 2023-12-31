import { Cross2Icon } from "@radix-ui/react-icons";
import Flex from "./primitives/Flex";
import { FormField, FormRoot, Input } from "../components/Form";
import * as Form from "@radix-ui/react-form";
import Button from "./primitives/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogContent, DialogOverlay, DialogTitle, IconButton } from "./primitives/Dialog";
import React, { useState } from "react";
import { fileToDataUrl, handleGeneratePassword } from "../utils";
import { styled } from "@stitches/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PasswordContainer = styled(Flex, {
    gap: "1rem",
});

interface AddPasswordFormProps {
    setUpdate: (update: boolean) => void;
    update: boolean;
}

const AddPasswordForm: React.FC<AddPasswordFormProps> = ({ setUpdate, update }) => {
    const token = localStorage.getItem("token");
    const key = localStorage.getItem("key");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [url, setURL] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const image = await fileToDataUrl(url);

        try {
            await axios.post(
                "/items/add",
                {
                    name,
                    password,
                    imageDataURL: image,
                    key,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setUpdate(!update);
        } catch (error: any) {
            if (error.response.status === 498) {
                localStorage.removeItem("token");
                localStorage.removeItem("key");
                localStorage.removeItem("uId");
                navigate("/login");
            }
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <Button css={{ marginLeft: "auto" }}>Add password</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <DialogOverlay />
                <DialogContent>
                    <Flex
                        css={{
                            alignItems: "center",
                            marginBottom: "2rem",
                            justifyContent: "space-between",
                        }}
                    >
                        <DialogTitle>Add your password</DialogTitle>
                        <Dialog.Close asChild>
                            <IconButton aria-label="Close">
                                <Cross2Icon />
                            </IconButton>
                        </Dialog.Close>
                    </Flex>
                    <Flex css={{ justifyContent: "center", alignItems: "center" }}>
                        <FormRoot
                            onSubmit={handleSubmit}
                            css={{
                                display: "flex",
                                flexDirection: "column",
                                gap: ".5rem",
                            }}
                        >
                            <FormField name="name">
                                <Form.Control asChild>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Name/Link"
                                    />
                                </Form.Control>
                            </FormField>
                            <PasswordContainer>
                                <FormField name="password">
                                    <Form.Control asChild>
                                        <Input
                                            type="password"
                                            value={password}
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
                            <FormField name="image">
                                <Form.Control asChild>
                                    <input type="file" onChange={(e) => setURL(e.target.files && e.target.files[0])} />
                                </Form.Control>
                            </FormField>

                            <Form.Submit asChild>
                                <Button
                                    type="submit"
                                    css={{
                                        width: "fit-content",
                                        alignSelf: "center",
                                        padding: "0 1.5rem",
                                    }}
                                >
                                    Add
                                </Button>
                            </Form.Submit>
                        </FormRoot>
                    </Flex>
                </DialogContent>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default AddPasswordForm;
