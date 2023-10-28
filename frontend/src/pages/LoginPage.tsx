import Login from "../components/Login";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;

    useEffect(() => {
        if (context.globalState.uId && context.globalState.token) {
            navigate("/");
        }
    }, [context.globalState.uId, context.globalState.token]);

    const handleLogin = (uId: string) => {
        setGlobalState((state) => ({
            ...state,
            uId,
        }));
        navigate("/verify");
    };

    return (
        <div>
            <Login onLogin={handleLogin} />
            <button onClick={() => navigate("/register")}>Don&rsquo;t have an account? Register</button>
            <button onClick={() => navigate("/reset")}>Forgot password?</button>
        </div>
    );
};

export default LoginPage;
