import { styled } from "@stitches/react";
import PasswordEntry from "./PasswordEntry";
import MainSection from "./MainSection";
import AddPasswordForm from "./AddPasswordForm";
import axios from "axios";
import { useEffect, useState } from "react";

const SubtitleContainer = styled("div", {
    display: "flex",
    alignItems: "center",
});

const PasswordsContainer = styled("div", {
    display: "flex",
    flexDirection: "column",
    border: "1px solid white",
    minHeight: 400,
    borderRadius: 12,
    marginTop: "2rem",
    padding: "1rem",
});

interface Item {
    name: string;
    password: string;
    imageDataURL: string;
}

const Home = () => {
    const [update, setUpdate] = useState(false);
    const [items, setItems] = useState<Array<Item>>([]);
    const token = localStorage.getItem("token");
    // const uId = localStorage.getItem("uId");
    const key = localStorage.getItem("key");
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getItems();
    }, [update]);

    const getItems = async () => {
        try {
            const response = await axios.post(
                "/items/get",
                {
                    key,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setItems(response.data.items);
        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    };

    return (
        <MainSection>
            <h1>Welcome</h1>
            <SubtitleContainer>
                <p>Save, change, or remove passwords.</p>
                <AddPasswordForm setUpdate={setUpdate} update={update} />
            </SubtitleContainer>
            <PasswordsContainer>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    items.map((item) => (
                        <PasswordEntry update={update} setUpdate={setUpdate} key={item.name} item={item} />
                    ))
                )}
            </PasswordsContainer>
        </MainSection>
    );
};

export default Home;
