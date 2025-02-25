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

    const [password, setPassword] = useState(""); // 현재 비밀번호 입력
    const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인

    useEffect(() => {
        if (user) {
            setUpdatedUser({
                name: user.name || "",
                phone: user.phone || "",
                email: user.email || "",
                address: user.address || "",
                password: "", // 새 비밀번호는 기본적으로 비움
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.updateUser(updatedUser);
            updateUser(updatedUser); // 회원 정보 수정 후 TopBar 반영
            alert("회원 정보가 수정되었습니다.");
            // 상태를 초기화하여 입력 필드 비우기
            setUpdatedUser((prev) => ({
                ...prev,
                password: "", // 새 비밀번호 필드 초기화
            }));
            // 탈퇴 비밀번호 입력 필드 비우기
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            alert("회원 정보 수정에 실패했습니다.");
        }
    };

    // updatedUser가 변경될 때 password 필드 초기화
    useEffect(() => {
        setUpdatedUser((prev) => ({ ...prev, password: "" }));
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
                    <input type="password" name="password" placeholder="새 비밀번호 입력" value={updatedUser.password} onChange={handleChange} />

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
        </div>
    );
};

export default EditProfile;
