import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import EZPackingLayout from "./components/EZPackingLayout";
import Notice from "./pages/Notice"
import "./App.css";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/prohibit" element={<ProhibitedItems />} />
            <Route path="/board" element={<Notice />} />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;