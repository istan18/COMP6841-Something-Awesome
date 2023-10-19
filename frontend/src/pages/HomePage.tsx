import { useEffect } from "react";
import { useGlobalState } from "../GlobalStateContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const context = useGlobalState();
    const navigate = useNavigate();

    useEffect(() => {
        if (!context.globalState.isLoggedIn) {
            navigate("/register");
        }
    }, [context.globalState.isLoggedIn]);

    return (
        <div>
            <div>
                <h1>Welcome!</h1>
                {/* Your logged-in content goes here */}
            </div>
        </div>
    );
};

export default HomePage;
