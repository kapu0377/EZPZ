import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1>EZPacking</h1>
      {user ? (
        <>
          <p>안녕하세요, {user.name}님!</p>
          <Link to="/packing" className="start-button">
            짐 싸기 시작하기
          </Link>
        </>
      ) : (
        <p>로그인하여 서비스를 이용해보세요.</p>
      )}
    </div>
  );
};

export default Home; 