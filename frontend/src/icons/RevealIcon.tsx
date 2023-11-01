import IconWrapper from "./IconWrapper";
import React from "react";

interface RevealIconProps {
    onClick: () => void;
}

const RevealIcon: React.FC<RevealIconProps> = ({ onClick }) => {
    return (
        <IconWrapper onClick={onClick}>
            <path
                d="M28.35 13.5643C28.7054 13.958 28.9021 14.4696 28.9021 15C28.9021 15.5304 28.7054 16.042 28.35 16.4357C26.1 18.8571 20.9786 23.5714 15 23.5714C9.02141 23.5714 3.89998 18.8571 1.64998 16.4357C1.29461 16.042 1.0979 15.5304 1.0979 15C1.0979 14.4696 1.29461 13.958 1.64998 13.5643C3.89998 11.1429 9.02141 6.42857 15 6.42857C20.9786 6.42857 26.1 11.1429 28.35 13.5643Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M15.0001 19.2857C17.367 19.2857 19.2858 17.3669 19.2858 15C19.2858 12.6331 17.367 10.7143 15.0001 10.7143C12.6331 10.7143 10.7144 12.6331 10.7144 15C10.7144 17.3669 12.6331 19.2857 15.0001 19.2857Z"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </IconWrapper>
    );
};

export default RevealIcon;
