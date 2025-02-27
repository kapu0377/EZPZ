import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import authApi from "../api/authApi";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth(); 
    const [updatedUser, setUpdatedUser] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        password: "",
    });

    const [newPasswordConfirm, setNewPasswordConfirm] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [passwordError, setPasswordError] = useState(""); 
    const [passwordsMatch, setPasswordsMatch] = useState(false); 
    const [dbPasswordValid, setDbPasswordValid] = useState(false); 
    const [isVerifying, setIsVerifying] = useState(false); 
    const [verificationMessage, setVerificationMessage] = useState(""); 
    
    const [showModal, setShowModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState(""); 

    useEffect(() => {
        if (user) {
            setUpdatedUser({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                address: user.address || "",
                password: "", 
            });
            setNewPasswordConfirm(""); 
        }
    }, [user]); 

    // 비밀번호 검증 함수
    const verifyPassword = useCallback(
        async (pw) => {
            if (!pw || pw.length < 4) {
                setDbPasswordValid(false);
                setVerificationMessage("");
                return;
            }
            
            setIsVerifying(true);
            setVerificationMessage("비밀번호 확인 중...");
            
            try {
                const result = await authApi.verifyPassword(pw);
                
                if (result.valid) {
                    setDbPasswordValid(true);
                    setVerificationMessage("비밀번호가 확인되었습니다.");
                } else {
                    setDbPasswordValid(false);
                    setVerificationMessage("현재 비밀번호가 일치하지 않습니다.");
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setDbPasswordValid(false);
                    setVerificationMessage("현재 비밀번호가 일치하지 않습니다.");
                } else {
                    console.error("비밀번호 검증 중 오류:", error);
                    setDbPasswordValid(false);
                    setVerificationMessage("비밀번호 확인에 실패했습니다.");
                }
            } finally {
                setIsVerifying(false);
            }
        },
        []
    );

    const handleChange = (e) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
        
        if (e.target.name === "password") {
            setPasswordError("");
        }
    };

    const validatePasswords = () => {
        if (updatedUser.password && updatedUser.password !== newPasswordConfirm) {
            setPasswordError("새 비밀번호가 일치하지 않습니다.");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const getPasswordMatchClass = () => {
        if (!updatedUser.password || !newPasswordConfirm) return "";
        return updatedUser.password === newPasswordConfirm ? "password-match" : "password-mismatch";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (updatedUser.password) {
            if (!validatePasswords()) {
                return;
            }
        }
        
        setShowModal(true);
    };
    
    const handleConfirmPassword = async () => {
        if (!currentPassword) {
            setPasswordError("현재 비밀번호를 입력해주세요.");
            return;
        }
        
        try {
            await authApi.updateUser({
                ...updatedUser,
                currentPassword: currentPassword 
            });
            await updateUser(); 
            alert("회원 정보가 수정되었습니다.");
            
            setShowModal(false);
            setCurrentPassword("");
            setNewPasswordConfirm("");
            setUpdatedUser(prev => ({...prev, password: ""}));
            setPasswordError("");
            
            navigate("/");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setPasswordError("현재 비밀번호가 일치하지 않습니다.");
            } else {
                alert("회원 정보 수정에 실패했습니다.");
            }
        }
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentPassword("");
        setPasswordError("");
    };

    useEffect(() => {
        setUpdatedUser((prev) => ({ ...prev, password: "" }));
        setNewPasswordConfirm("");
    }, []);

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        setPasswordsMatch(newPassword === confirmPassword && newPassword !== "");
        
        if (newPassword && newPassword === confirmPassword) {
            const timeoutId = setTimeout(() => {
                verifyPassword(newPassword);
            }, 500);
            
            return () => clearTimeout(timeoutId);
        } else {
            setDbPasswordValid(false);
            setVerificationMessage("");
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);
        
        setPasswordsMatch(password === newConfirmPassword && password !== "");
        
        if (password === newConfirmPassword) {
            const timeoutId = setTimeout(() => {
                verifyPassword(password);
            }, 500);
            
            return () => clearTimeout(timeoutId);
        }
    };

    const handleDeleteAccount = async () => {
        if (!password || !confirmPassword) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            setPassword("");
            setConfirmPassword("");
            return;
        }
        
        if (!dbPasswordValid) {
            alert("현재 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            if (window.confirm("모든 데이터가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
                await authApi.deleteUser(password);
                alert("회원 탈퇴가 완료되었습니다.");
                logout(); 
                navigate("/");
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert("비밀번호가 일치하지 않습니다.");
            } else {
                alert("회원 탈퇴에 실패했습니다: " + (error.response?.data || error.message));
            }
            setPassword("");
            setConfirmPassword("");
            setPasswordsMatch(false);
            setDbPasswordValid(false);
        }
    };

    return (
        <div className="edit-profile-container">
            {/* 회원 정보 수정  */}
            <section className="profile-section">
                <h2>회원 정보 수정</h2>
                <form onSubmit={handleSubmit}>
                <label>이름</label>
                    <input type="text" name="name" value={updatedUser.name} onChange={handleChange} required />

                    <label>이메일</label>
                    <input type="email" name="email" value={updatedUser.email} disabled />

                    <label>전화번호</label>
                    <input type="text" name="phone" value={updatedUser.phone} onChange={handleChange} />

                    <label>주소</label>
                    <input type="text" name="address" value={updatedUser.address} onChange={handleChange} />

                    <label>새 비밀번호</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="새 비밀번호 입력" 
                        value={updatedUser.password} 
                        onChange={handleChange} 
                        className={updatedUser.password && newPasswordConfirm ? getPasswordMatchClass() : ""}
                    />

                    <label>새 비밀번호 확인</label>
                    <input 
                        type="password" 
                        placeholder="새 비밀번호 확인" 
                        value={newPasswordConfirm} 
                        onChange={(e) => {
                            setNewPasswordConfirm(e.target.value);
                            setPasswordError("");
                        }} 
                        className={updatedUser.password && newPasswordConfirm ? getPasswordMatchClass() : ""}
                    />
                    
                    {passwordError && <p className="error-message">{passwordError}</p>}

                    <button type="submit" className="update-btn">수정하기</button>
                </form>
            </section>

            {/* 회원 탈퇴 섹션 */}
            <section className="delete-account-section">
                <h3>회원 탈퇴</h3>
                <p>탈퇴를 원하시면 현재 비밀번호를 입력하세요.</p>
                <input
                    type="password"
                    placeholder="현재 비밀번호"
                    value={password}
                    onChange={handlePasswordChange}
                    className={password && confirmPassword && passwordsMatch ? (dbPasswordValid ? "password-match" : "password-mismatch") : ""}
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={password && confirmPassword ? (passwordsMatch ? "password-match" : "password-mismatch") : ""}
                />
                {password && confirmPassword && passwordsMatch && (
                    <p className={dbPasswordValid ? "password-message-valid" : "password-message-invalid"}>
                        {isVerifying ? "비밀번호 확인 중..." : verificationMessage}
                    </p>
                )}
                {!passwordsMatch && confirmPassword && (
                    <p className="password-message-invalid">비밀번호가 일치하지 않습니다.</p>
                )}
                <button 
                    onClick={handleDeleteAccount} 
                    className={`delete-btn ${!(passwordsMatch && dbPasswordValid) ? "button-disabled" : ""}`}
                    disabled={!(passwordsMatch && dbPasswordValid)}
                >
                    회원 탈퇴
                </button>
            </section>
            
            {/* 비밀번호 확인 모달 */}
            {showModal && (
                <div className="password-modal-overlay">
                    <div className="password-modal">
                        <h3>현재 비밀번호 확인</h3>
                        <p>회원 정보를 수정하려면 현재 비밀번호를 입력하세요.</p>
                        <input
                            type="password"
                            placeholder="현재 비밀번호"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        {passwordError && <p className="error-message">{passwordError}</p>}
                        <div className="modal-buttons">
                            <button onClick={handleConfirmPassword} className="confirm-btn">확인</button>
                            <button onClick={handleCloseModal} className="cancel-btn">취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;
