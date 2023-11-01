import { styled } from "@stitches/react";

const Button = styled("button", {
    all: "unset",
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: "0 15px",
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 500,
    height: 35,
    cursor: "pointer",

    backgroundColor: "#286793",
    color: "white",
    "&:hover": {
        backgroundColor: "#5696c2",
    },
});

export default Button;
