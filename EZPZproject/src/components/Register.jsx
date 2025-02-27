import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/authApi";
import "./Register.css";

const Register = ({ isOpen, onClose }) => {
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

  const resetFormData = () => {
    setFormData({
      username: "",
      password: "",
      passwordConfirm: "",
      name: "",
      phone: "",
      email: "",
      gender: "",
      address: ""
    });
    setPasswordMatch({
      isValid: false,
      message: ""
    });
  };

  useEffect(() => {
    if (isOpen) {
      resetFormData();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetFormData();
    onClose();
  };

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
    
    const signUpRequest = {
      username: formData.username,
      password: formData.password,
      name: formData.name,
      phone: formData.phone.replace(/[^0-9]/g, ''),
      email: formData.email,
      gender: formData.gender,
      address: formData.address
    };
    
    try {
      const response = await authApi.signup(signUpRequest);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      handleClose();
    } catch (error) {
      if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert("회원가입 실패: " + error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="register-container">
        <form onSubmit={handleSubmit} className="register-form" autoComplete="off">
          <div className="form-header">
            <h2>회원가입</h2>
            <button type="button" className="close-button" onClick={handleClose}>×</button>
          </div>
          <input
            type="text"
            placeholder="아이디"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            autoComplete="off"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <div className="password-input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={formData.password}
              onChange={handlePasswordChange}
              className={formData.passwordConfirm && (passwordMatch.isValid ? "valid" : "invalid")}
              required
              autoComplete="new-password"
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
            />
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={formData.passwordConfirm}
              onChange={handlePasswordConfirmChange}
              className={formData.passwordConfirm && (passwordMatch.isValid ? "valid" : "invalid")}
              required
              autoComplete="new-password"
              onCopy={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoComplete="off"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <input
            type="number"
            placeholder="전화번호 (숫자 11자리)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            autoComplete="off"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <input
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="off"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <div className="gender-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
              여성
            </label>
          </div>
          <input
            type="text"
            placeholder="주소"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            autoComplete="off"
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <button 
            type="submit" 
            disabled={!passwordMatch.isValid}
            className={!passwordMatch.isValid ? "button-disabled" : ""}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register; 
