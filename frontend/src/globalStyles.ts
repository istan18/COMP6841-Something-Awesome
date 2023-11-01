import { globalCss } from "@stitches/react";

export const globalStyles = globalCss({
    "*": { margin: 0, padding: 0 },
    "#root, body, html": { height: "100%" },
    html: {
        backgroundColor: "#0f1423",
    },
    body: {
        color: "white",
        fontFamily: "Inter, sans-serif",
    },
});
