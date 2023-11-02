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
import ChangeIcon from "../icons/ChangeIcon";

const PasswordContainer = styled(Flex, {
    gap: "1rem",
});

interface Item {
    name: string;
    password: string;
    imageDataURL: string;
}
interface EditPasswordFormProps {
    setUpdate: (update: boolean) => void;
    update: boolean;
    item: Item;
}

const EditPasswordForm: React.FC<EditPasswordFormProps> = ({ setUpdate, update, item }) => {
    const token = localStorage.getItem("token");
    const key = localStorage.getItem("key");
    const [password, setPassword] = useState("");
    const [url, setURL] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const image = await fileToDataUrl(url);

        try {
            await axios.post(
                `/items/edit/${item.name}`,
                {
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
                <button
                    style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        outline: "none",
                        padding: "0",
                        margin: "0",
                    }}
                >
                    <ChangeIcon />
                </button>
                {/* <Button css={{ marginLeft: "auto" }}>Edit password</Button> */}
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
                        <DialogTitle>Edit your password</DialogTitle>
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
                                    Save
                                </Button>
                            </Form.Submit>
                        </FormRoot>
                    </Flex>
                </DialogContent>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default EditPasswordForm;
