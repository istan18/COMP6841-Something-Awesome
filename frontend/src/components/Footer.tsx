import { styled } from "@stitches/react";
import * as Separator from "@radix-ui/react-separator";
import Flex from "./primitives/Flex";
import React from "react";

const FooterContainer = styled("footer", {
    boxSizing: "border-box",
    height: "3rem",
    padding: "0 1rem",
    marginTop: "auto",
});

const SeparatorRoot = styled(Separator.Root, {
    backgroundColor: "white",
    "&[data-orientation=horizontal]": { height: 1, width: "98%" },
});

const Text = styled("p", {});

const TextContainer = styled(Flex, {
    flexDirection: "column",
    marginLeft: "1rem",
    gap: ".3rem",
});

const Link = styled("a", {
    textDecoration: "underline",
});

const Footer = () => {
    return (
        <FooterContainer>
            <SeparatorRoot decorative orientation="horizontal" css={{ margin: "auto" }} />
            <Flex css={{ paddingTop: "1rem" }}>
                <svg width="57" height="57" viewBox="0 0 57 57" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M30.0231 55.7163C29.0429 56.0946 27.9571 56.0946 26.9769 55.7163V55.7163C19.3222 52.7141 12.7494 47.4746 8.11566 40.6809C3.48193 33.8873 1.00227 25.8547 1 17.6307V5.23173C1 4.10941 1.44574 3.03305 2.23916 2.23945C3.03259 1.44584 4.1087 1 5.23077 1H51.7692C52.8913 1 53.9674 1.44584 54.7608 2.23945C55.5542 3.03305 56 4.10941 56 5.23173V17.5884C56.0062 25.8196 53.5305 33.8615 48.8962 40.6635C44.262 47.4655 37.6845 52.7115 30.0231 55.7163V55.7163Z"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M34.8461 22.1586H22.1538C19.8172 22.1586 17.923 24.0532 17.923 26.3903V34.8538C17.923 37.1909 19.8172 39.0855 22.1538 39.0855H34.8461C37.1827 39.0855 39.0769 37.1909 39.0769 34.8538V26.3903C39.0769 24.0532 37.1827 22.1586 34.8461 22.1586Z"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M34.8461 22.1586V17.9269C34.8461 17.0933 34.682 16.2679 34.363 15.4978C34.0441 14.7276 33.5767 14.0279 32.9874 13.4385C32.3981 12.849 31.6985 12.3815 30.9285 12.0625C30.1586 11.7435 29.3333 11.5793 28.5 11.5793C27.6666 11.5793 26.8413 11.7435 26.0714 12.0625C25.3014 12.3815 24.6018 12.849 24.0126 13.4385C23.4233 14.0279 22.9558 14.7276 22.6369 15.4978C22.318 16.2679 22.1538 17.0933 22.1538 17.9269V22.1586"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <TextContainer>
                    <Text>2023. chrico&apos;s password manager.</Text>
                    <Link>Contact Us</Link>
                </TextContainer>
            </Flex>
        </FooterContainer>
    );
};

export default Footer;
