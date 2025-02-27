import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import authApi from "../api/authApi";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth(); // updateUser 가져오기
    const [updatedUser, setUpdatedUser] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        password: "",
    });

    const [newPasswordConfirm, setNewPasswordConfirm] = useState(""); // 새 비밀번호 확인
    const [password, setPassword] = useState(""); // 현재 비밀번호 입력 (탈퇴용)
    const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 (탈퇴용)
    const [passwordError, setPasswordError] = useState(""); // 비밀번호 오류 메시지
    
    // 모달 관련 상태
    const [showModal, setShowModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState(""); // 현재 비밀번호 (모달용)

     // user 값이 변경될 때 updatedUser 업데이트 (새로고침 없이 반영)
     useEffect(() => {
        if (user) {
            setUpdatedUser({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                address: user.address || "",
                password: "", // 새 비밀번호는 기본적으로 비움
            });
            setNewPasswordConfirm(""); // 비밀번호 확인 필드 초기화
        }
    }, [user]); // user 변경 감지
    

    const handleChange = (e) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
        
        // 비밀번호 변경 시 오류 메시지 초기화
        if (e.target.name === "password") {
            setPasswordError("");
        }
    };

    // 비밀번호 일치 여부 확인
    const validatePasswords = () => {
        if (updatedUser.password && updatedUser.password !== newPasswordConfirm) {
            setPasswordError("새 비밀번호가 일치하지 않습니다.");
            return false;
        }
        setPasswordError("");
        return true;
    };

    // 비밀번호 일치 여부에 따른 클래스 결정
    const getPasswordMatchClass = () => {
        if (!updatedUser.password || !newPasswordConfirm) return "";
        return updatedUser.password === newPasswordConfirm ? "password-match" : "password-mismatch";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 비밀번호 변경을 시도하는 경우
        if (updatedUser.password) {
            // 새 비밀번호 확인
            if (!validatePasswords()) {
                return;
            }
        }
        
        // 현재 비밀번호 입력 모달 표시
        setShowModal(true);
    };
    
    // 모달에서 확인 버튼 클릭 시 실행
    const handleConfirmPassword = async () => {
        if (!currentPassword) {
            setPasswordError("현재 비밀번호를 입력해주세요.");
            return;
        }
        
        try {
            // 현재 비밀번호 검증 및 회원 정보 업데이트
            await authApi.updateUser({
                ...updatedUser,
                currentPassword: currentPassword // 현재 비밀번호 전달
            });
            await updateUser(); // 회원 정보 수정 후 TopBar에 즉시 반영
            alert("회원 정보가 수정되었습니다.");
            
            // 상태 초기화
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
    
    // 모달 닫기
    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentPassword("");
        setPasswordError("");
    };

    // updatedUser가 변경될 때 password 필드 초기화
    useEffect(() => {
        setUpdatedUser((prev) => ({ ...prev, password: "" }));
        setNewPasswordConfirm("");
    }, []);

    const handleDeleteAccount = async () => {
        if (!password || !confirmPassword) {
            alert("비밀번호를 입력해주세요."); // 비밀번호 입력 여부 확인
            return;
        }

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다."); // 비밀번호 불일치 체크
            setPassword("");
            setConfirmPassword("");
            return;
        }

        try {
            if (window.confirm("모든 데이터가 삭제됩니다. 정말 탈퇴하시겠습니까?")) {
                await authApi.deleteUser(password);
                alert("회원 탈퇴가 완료되었습니다.");
                logout(); // 로그아웃 후 메인 페이지로 이동
                navigate("/");
            }
        } catch (error) {
            alert("회원 탈퇴에 실패했습니다. 비밀번호를 확인하세요.");
        }
    };


    return (
        <div className="edit-profile-container">
            {/* 회원 정보 수정 섹션 */}
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
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button onClick={handleDeleteAccount} className="delete-btn">회원 탈퇴</button>
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
