import React, { useState, useEffect } from "react";
import authApi from "../api/authApi";
import "./EditProfile.css";

const EditProfile = () => {
    const [user, setUser] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        password: ""
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userData = await authApi.getUserProfile();
                setUser({
                    name: userData.name || "",
                    phone: userData.phone || "",
                    email: userData.email || "",
                    address: userData.address || "",
                    password: "" // 비밀번호는 기본적으로 비워둠
                });
            } catch (error) {
                console.error("사용자 정보를 불러오는 중 오류 발생:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authApi.updateUser(user);
            // setMessage("회원 정보가 수정되었습니다.");
            window.alert("회원 정보가 수정되었습니다.");
            localStorage.setItem("name", user.name);
        } catch (error) {
            console.error("회원 정보 수정 오류:", error);
            setMessage("회원 정보 수정에 실패했습니다.");
        }
    };

  
    return (
        <div className="edit-profile-container">
            <h2>회원 정보 수정</h2>
            <form onSubmit={handleSubmit}>
                <label>이름</label>
                <input type="text" name="name" value={user.name} onChange={handleChange} required />

                <label>이메일</label>
                <input type="email" name="email" value={user.email} onChange={handleChange} />

                <label>전화번호</label>
                <input type="text" name="phone" value={user.phone} onChange={handleChange} />

                <label>주소</label>
                <input type="text" name="address" value={user.address} onChange={handleChange} />

                <label>새 비밀번호</label>
                <input type="password" name="password" value={user.password} onChange={handleChange} />

                <button type="submit">수정하기</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default EditProfile;
