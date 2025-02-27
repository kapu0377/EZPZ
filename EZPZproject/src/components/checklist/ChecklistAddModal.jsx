import React, { useState } from "react";
import "./ChecklistAddModal.css";

export default function ChecklistAddModal({ isOpen, onClose, onAdd, onRequireLogin }) {
    const [title, setTitle] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");

    if (!isOpen) return null; // 모달이 열려 있을 때만 표시

    const handleSubmit = async () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            onRequireLogin(); // 로그인 필요 시 로그인 모달 호출
            return;
        }

        if (!title.trim() || !departureDate.trim() || !returnDate.trim()) {
            alert("제목, 출발일, 도착일을 모두 입력하세요.");
            return;
        }

        await onAdd(title, departureDate, returnDate);

        // 입력 필드 초기화 및 모달 닫기
        setTitle("");
        setDepartureDate("");
        setReturnDate("");
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content2">
                <h2>새 체크리스트 추가</h2>
                <div className="date-input-container">
                    <label htmlFor="tour title">여행 제목</label>
                    <input id="tour title" type="text" placeholder="여행 제목을 입력해주세요." value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="date-input-container">
                    <label htmlFor="departure-date">출발일</label>
                    <input
                        id="departure-date"
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                    />
                </div>
                <div className="date-input-container">
                    <label htmlFor="return-date">도착일</label>
                    <input
                        id="return-date"
                        type="date"
                        value={returnDate}
                        min={departureDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                    />
                </div>
                <div className="checklist-modal-buttons">
                    <button className="category-cancel-btn" onClick={onClose}>취소</button>
                    <button className="category-save-btn" onClick={handleSubmit}>추가</button>
                </div>
            </div>
        </div>
    );
}
