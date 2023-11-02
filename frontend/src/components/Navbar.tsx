import { styled } from "@stitches/react";
import Button from "./primitives/Button";
import * as Separator from "@radix-ui/react-separator";
import Flex from "./primitives/Flex";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import React from "react";

const NavigationBar = styled("nav", {
    display: "flex",
    alignItems: "center",
    padding: "1.5rem 1rem",
    height: "3rem",
    position: "sticky",
});

const Name = styled("p", {
    fontSize: 18,
    fontWeight: 800,
    fontStyle: "italic",
});

const LogoContainer = styled(Flex, {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
});

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (uId) {
            try {
                await axios.post("/users/signout", null, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                localStorage.removeItem("token");
                localStorage.removeItem("uId");
                localStorage.removeItem("key");

                console.log("Sign out successful");
            } catch (error: any) {
                if (error.response.status === 498) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("key");
                    localStorage.removeItem("uId");
                    navigate("/login");
                }
                console.log(error);
            }
        }
        navigate("/login");
    };
    return (
        <>
            <NavigationBar>
                <LogoContainer>
                    <svg width="58" height="54" viewBox="0 0 58 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M30.5973 51.5444C29.6214 51.8869 28.5403 51.8869 27.5644 51.5444V51.5444C19.9428 48.826 13.3985 44.0817 8.78484 37.9302C4.17119 31.7787 1.70227 24.5054 1.70001 17.0587V5.83174C1.70001 4.8155 2.14382 3.84088 2.93381 3.12229C3.72379 2.4037 4.79524 2 5.91245 2H52.2492C53.3664 2 54.4379 2.4037 55.2279 3.12229C56.0178 3.84088 56.4617 4.8155 56.4617 5.83174V17.0204C56.4679 24.4736 54.0029 31.7553 49.3887 37.9144C44.7745 44.0735 38.2256 48.8236 30.5973 51.5444V51.5444Z"
                            stroke="#6B1515"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M35.3995 21.1587H22.7622C20.4357 21.1587 18.5497 22.8742 18.5497 24.9904V32.6539C18.5497 34.7701 20.4357 36.4856 22.7622 36.4856H35.3995C37.7259 36.4856 39.6119 34.7701 39.6119 32.6539V24.9904C39.6119 22.8742 37.7259 21.1587 35.3995 21.1587Z"
                            stroke="#6B1515"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M35.3995 21.1587V17.327C35.3995 16.5722 35.2361 15.8248 34.9185 15.1274C34.601 14.4301 34.1356 13.7965 33.5488 13.2628C32.9621 12.7291 32.2655 12.3057 31.4989 12.0169C30.7323 11.728 29.9106 11.5793 29.0809 11.5793C28.2511 11.5793 27.4294 11.728 26.6628 12.0169C25.8962 12.3057 25.1996 12.7291 24.6129 13.2628C24.0262 13.7965 23.5607 14.4301 23.2432 15.1274C22.9256 15.8248 22.7622 16.5722 22.7622 17.327V21.1587"
                            stroke="#6B1515"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <Name>pwm</Name>
                </LogoContainer>
                <Button onClick={handleClick} css={{ marginLeft: "90%", padding: "0 1.5rem" }}>
                    {!uId ? "Login" : "Logout"}
                </Button>
            </NavigationBar>
            <SeparatorRoot decorative orientation="horizontal" css={{ margin: "auto" }} />
        </>
    );
};

const SeparatorRoot = styled(Separator.Root, {
    backgroundColor: "white",
    "&[data-orientation=horizontal]": { height: 1, width: "98%" },
});

export default Navbar;
