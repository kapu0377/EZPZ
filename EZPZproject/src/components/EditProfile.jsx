import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import authApi from "../api/authApi";
import "./EditProfile.css";

const EditProfile = () => {
    const { user, updateUser } = useAuth(); // updateUser 가져오기
    const [updatedUser, setUpdatedUser] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        password: "",
    });

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
        } catch (error) {
            alert("회원 정보 수정에 실패했습니다.");
        }
    };

    return (
        <div className="edit-profile-container">
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
                <input type="password" name="password" value={updatedUser.password} onChange={handleChange} />

                <button type="submit">수정하기</button>
            </form>
        </div>
    );
};

export default EditProfile;
