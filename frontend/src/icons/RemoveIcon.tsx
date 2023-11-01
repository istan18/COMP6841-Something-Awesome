import React, { MouseEventHandler } from "react";
import IconWrapper from "./IconWrapper";

interface RemoveIconProps {
    onClick: MouseEventHandler<SVGSVGElement>;
}

const RemoveIcon: React.FC<RemoveIconProps> = ({ onClick }) => {
    return (
        <IconWrapper onClick={onClick} css={{ width: 25, height: 25 }}>
            <path d="M24.1071 0.892857L0.892822 24.1071" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0.892822 0.892857L24.1071 24.1071" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </IconWrapper>
    );
};

export default RemoveIcon;
