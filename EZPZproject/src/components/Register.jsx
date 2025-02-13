import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: ""
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.signup(formData);
      alert("회원가입 성공!");
      navigate("/login");
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("회원가입 실패: " + error.message);
      }
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>회원가입</h2>
        <input
          type="text"
          placeholder="아이디"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="이름"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default Register; 
