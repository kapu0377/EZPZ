import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    email: "",
    gender: "",
    address: ""
  });
  
  const [passwordMatch, setPasswordMatch] = useState({
    isValid: false,
    message: ""
  });
  
  const navigate = useNavigate();

  const validatePassword = (password, passwordConfirm) => {
    if (passwordConfirm === "") {
      setPasswordMatch({
        isValid: false,
        message: "비밀번호 확인을 입력해주세요."
      });
    } else if (password === passwordConfirm) {
      setPasswordMatch({
        isValid: true,
        message: "비밀번호가 일치합니다."
      });
    } else {
      setPasswordMatch({
        isValid: false,
        message: "비밀번호가 일치하지 않습니다."
      });
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePassword(newPassword, formData.passwordConfirm);
  };

  const handlePasswordConfirmChange = (e) => {
    const newPasswordConfirm = e.target.value;
    setFormData({ ...formData, passwordConfirm: newPasswordConfirm });
    validatePassword(formData.password, newPasswordConfirm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordMatch.isValid) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // formData에서 passwordConfirm 필드를 분리하여 dataToSend 객체 생성 (백엔드로 전송되지 않음)
    const { passwordConfirm, ...dataToSend } = formData;

    try {
      await authApi.signup(dataToSend);
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
        <div className="password-input-group">
          <input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handlePasswordChange}
            className={formData.passwordConfirm && (passwordMatch.isValid ? "valid" : "invalid")}
            required
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={formData.passwordConfirm}
            onChange={handlePasswordConfirmChange}
            className={formData.passwordConfirm && (passwordMatch.isValid ? "valid" : "invalid")}
            required
          />
          {formData.passwordConfirm && (
            <span className={`password-message ${passwordMatch.isValid ? "valid" : "invalid"}`}>
              {passwordMatch.message}
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="이름"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
        <input
          type="tel"
          placeholder="전화번호 (예: 01012345678)"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          required
        />
        <input
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="주소"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
        <div className="gender-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="MALE"
              checked={formData.gender === "MALE"}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              required
            />
            남성
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="FEMALE"
              checked={formData.gender === "FEMALE"}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            />
            여성
          </label>
        </div>
        <button 
          type="submit" 
          disabled={!passwordMatch.isValid}
          className={!passwordMatch.isValid ? "button-disabled" : ""}
        >
          가입하기
        </button>
      </form>
    </div>
  );
};

export default Register;
