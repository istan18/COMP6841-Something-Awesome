import { useEffect } from "react";
import Register from "../components/Register";
import React, { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const uId = localStorage.getItem("uId");

    useEffect(() => {
        if (uId && token) {
            navigate("/");
        }
    }, []);

    const handleRegister = (uId: string, key: string) => {
        localStorage.setItem("uId", uId);
        localStorage.setItem("key", key);
        navigate("/verify");
    };
    return <Register onRegister={handleRegister} />;
};

export default RegisterPage;
