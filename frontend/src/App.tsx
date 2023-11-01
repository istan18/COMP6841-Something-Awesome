import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import ResetPage from "./pages/ResetPage";
import { globalStyles } from "./globalStyles";
import "./App.css";

const App = () => {
    globalStyles();
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/reset" element={<ResetPage />} />
                <Route path="/reset/:token" element={<ResetPage />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
};

export default App;
