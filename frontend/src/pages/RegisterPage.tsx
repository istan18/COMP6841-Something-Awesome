import { useEffect } from "react";
import Register from "../components/Register";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;

    useEffect(() => {
        if (context.globalState.isLoggedIn) {
            navigate("/");
        }
    }, [context.globalState.isLoggedIn]);

    const handleRegister = (token: string) => {
        localStorage.setItem("token", token);
        setGlobalState((state) => ({
            ...state,
            token,
        }));
        navigate("/verify");
    };
    return (
        <div>
            <Register onRegister={handleRegister} />
            <button onClick={() => navigate("/login")}>Have an account? Log in</button>
        </div>
    );
};

export default RegisterPage;
