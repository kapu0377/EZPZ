import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="아이디"
          value={credentials.username}
          onChange={(e) =>
            setCredentials({ ...credentials, username: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={credentials.password}
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
          required
        />
        <button type="submit">로그인</button>
        <div className="login-links">
          <Link to="/register">회원가입</Link>
          <Link to="/forgot-password">비밀번호 찾기</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;