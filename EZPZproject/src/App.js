import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import EZPackingLayout from "./components/EZPackingLayout";
import Notice from "./pages/Notice"
import "./App.css";
import "./components/board/Notice.css";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";
import AirportParkingPage from "./pages/AirportParkingPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/prohibit" element={<ProhibitedItems />} />
            <Route path="/parking" element={<AirportParkingPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;