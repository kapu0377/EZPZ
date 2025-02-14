import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import EZPackingLayout from "./components/EZPackingLayout";
import Notice from "./pages/Notice"
import MyPage from "./api/checklistApi"
// import MyPage from "./components/checklist/ChecklistPage";
import "./App.css";
import ProhibitedItems from "./components/prohibited-items/ProhibitedItems";
import CategoryItemPage from "./components/checklist/CategoryItemPage";

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
            <Route path="/prohibited" element={<ProhibitedItems />} />
            <Route path="/board" element={<Notice />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/checklist/:checklistId" element={<CategoryItemPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;