import * as Form from "@radix-ui/react-form";
import { styled } from "@stitches/react";

export const FormRoot = styled(Form.Root, {
    width: 260,
});

export const FormField = styled(Form.Field, {
    display: "grid",
    marginBottom: 10,
});

const inputStyles = {
    all: "unset",
    boxSizing: "border-box",
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,

    fontSize: 15,
    color: "black",
    backgroundColor: "white",
};

export const Input = styled("input", {
    ...inputStyles,
    height: 35,
    lineHeight: 1,
    padding: "0 0.7rem",
});
