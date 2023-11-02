/* eslint-disable @typescript-eslint/no-unused-vars */
import { styled } from "@stitches/react";
import * as Separator from "@radix-ui/react-separator";
import RevealIcon from "../icons/RevealIcon";
import ChangeIcon from "../icons/ChangeIcon";
import RemoveIcon from "../icons/RemoveIcon";
import Flex from "./primitives/Flex";
import React, { MouseEventHandler, useState } from "react";
import axios from "axios";
import EditPasswordForm from "./EditPasswordForm";

const Container = styled("div", {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1rem .5rem",
});

const RightContainer = styled(Flex, {
    marginLeft: "auto",
    alignItems: "center",
    gap: "3rem",
});

const PasswordFunctionalities = styled(Flex, {
    gap: "1rem",
    alignItems: "center",
});

const Circle = styled("img", {
    width: 25,
    height: 25,
    borderRadius: "50%",
    border: "1px solid white",
});

const SeparatorRoot = styled(Separator.Root, {
    backgroundColor: "gray",
    "&[data-orientation=horizontal]": { height: 1, width: "100%" },
});

interface Item {
    name: string;
    password: string;
    imageDataURL: string;
}

interface PasswordEntryProps {
    item: Item;
    setUpdate: (update: boolean) => void;
    update: boolean;
}

const representPasswordAsAsteriks = (password: string): string => "*".repeat(password.length);

const PasswordEntry: React.FC<PasswordEntryProps> = ({ item, setUpdate, update }) => {
    const [view, setView] = useState(false);
    const handleDelete = async () => {
        try {
            await axios.delete(`/items/delete/${item.name}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setUpdate(!update);
        } catch (error) {
            alert(error);
        }
    };
    return (
        <>
            <Container>
                <Circle alt={item.name} src={item.imageDataURL} />
                {item.name}
                <RightContainer>
                    {view ? item.password : representPasswordAsAsteriks(item.password)}
                    <PasswordFunctionalities>
                        <RevealIcon onClick={() => setView(!view)} />
                        <EditPasswordForm item={item} setUpdate={setUpdate} update={update} />
                        <RemoveIcon onClick={(_e) => handleDelete()} />
                    </PasswordFunctionalities>
                </RightContainer>
            </Container>
            <SeparatorRoot />
        </>
    );
};

export default PasswordEntry;
