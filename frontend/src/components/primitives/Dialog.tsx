import * as Dialog from "@radix-ui/react-dialog";
import { blackA, slate } from "@radix-ui/colors";
import { styled, keyframes } from "@stitches/react";

const overlayShow = keyframes({
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
});

const contentShow = keyframes({
    "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
    "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

export const DialogOverlay = styled(Dialog.Overlay, {
    backgroundColor: blackA.blackA6,
    position: "fixed",
    inset: 0,
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
});

export const DialogContent = styled(Dialog.Content, {
    backgroundColor: "#0f1423",
    borderRadius: 6,
    boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: 25,
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    "&:focus": { outline: "none" },
});

export const DialogTitle = styled(Dialog.Title, {
    margin: 0,
    fontWeight: 500,
    color: "white",
    fontSize: "1.5rem",
});

export const IconButton = styled("button", {
    all: "unset",
    fontFamily: "inherit",
    borderRadius: "100%",
    height: 30,
    width: 30,
    cursor: "pointer",
    fontSize: 17,

    "&:hover": { color: slate.slate5 },
    "&:hover svg": {
        stroke: "blue",
    },
});
