import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Register from "./Register";
import "./Login.css";

const Login = ({ isOpen, onClose }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  // 디버깅을 위한 클릭 핸들러
  const handleInputClick = (fieldName) => {
    console.log(`${fieldName} 입력 필드 클릭됨`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const success = await login(credentials);
      if (success) {
        window.dispatchEvent(new CustomEvent('login-success'));
        onClose();
      }
    } catch (error) {
      if (error.response?.data) {
        setError(error.response.data);
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const handleLoginClose = () => {
    setIsRegisterOpen(false);
    setCredentials({ username: "", password: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleLoginClose} style={{ zIndex: isRegisterOpen ? 999 : 1000 }}>
      <div className="login-container" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-header">
            <h2>로그인</h2>
            <button type="button" className="close-button" onClick={handleLoginClose}>×</button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            placeholder="아이디"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            onClick={() => handleInputClick('아이디')}
            onFocus={() => console.log('아이디 필드 포커스됨')}
            required
            autoComplete="off"
            disabled={isRegisterOpen}
            style={{ pointerEvents: isRegisterOpen ? 'none' : 'auto' }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            onClick={() => handleInputClick('비밀번호')}
            onFocus={() => console.log('비밀번호 필드 포커스됨')}
            required
            autoComplete="off"
            disabled={isRegisterOpen}
            style={{ pointerEvents: isRegisterOpen ? 'none' : 'auto' }}
          />
          <button type="submit" disabled={isRegisterOpen}>로그인</button>
          <div className="login-links">
            <button 
              type="button" 
              onClick={() => setIsRegisterOpen(true)}
              className="register-link"
              disabled={isRegisterOpen}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
      {isRegisterOpen && (
        <Register 
          isOpen={isRegisterOpen} 
          onClose={() => setIsRegisterOpen(false)}
        />
      )}
    </div>
  );
};

export default Login;