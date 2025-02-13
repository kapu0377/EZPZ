import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import EZPackingLayout from "./components/EZPackingLayout";
import "./App.css";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<EZPackingLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/prohibited" element={<ProhibitedItems />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;