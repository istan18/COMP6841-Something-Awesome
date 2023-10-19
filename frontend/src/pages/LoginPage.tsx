import Login from "../components/Login";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();
    const setGlobalState = context.setGlobalState;

    useEffect(() => {
        if (context.globalState.isLoggedIn) {
            navigate("/");
        }
    }, [context.globalState.isLoggedIn]);

    const handleLogin = (token: string) => {
        localStorage.setItem("token", token);
        console.log(token);
        setGlobalState((state) => ({
            ...state,
            token,
        }));
        navigate("/verify");
    };

    return (
        <div>
            <Login onLogin={handleLogin} />
            <button onClick={() => navigate("/register")}>Don&rsquo;t have an account? Register</button>
        </div>
    );
};

export default LoginPage;
