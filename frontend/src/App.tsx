import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { GlobalStateProvider } from "./GlobalStateContext";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import ResetPage from "./pages/ResetPage";

const App = () => {
    return (
        <GlobalStateProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify" element={<VerificationPage />} />
                    <Route path="/reset" element={<ResetPage />} />
                    <Route path="/reset/:token" element={<ResetPage />} />
                </Routes>
            </BrowserRouter>
        </GlobalStateProvider>
    );
};

export default App;
