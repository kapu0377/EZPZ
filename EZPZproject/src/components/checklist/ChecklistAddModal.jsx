import React, { useState } from "react";
import "./ChecklistAddModal.css"; // ✅ 스타일 적용

export default function ChecklistAddModal({ isOpen, onClose, onAdd }) {
    const [title, setTitle] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");

    if (!isOpen) return null; // ✅ 모달이 열려 있을 때만 표시

    const handleSubmit = () => {
        console.log("모달 입력값 확인");
        console.log("제목:", title);
        console.log("출발일:", departureDate);
        console.log("도착일:", returnDate);
        if (!title.trim() || !departureDate || !returnDate) {
            alert("제목, 출발일, 도착일을 모두 입력하세요.");
            return;
        }
        onAdd(title, departureDate, returnDate);
        setTitle("");
        setDepartureDate("");
        setReturnDate("");
        onClose(); // ✅ 추가 후 모달 닫기
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>새 체크리스트 추가</h2>
                <input 
                    type="text" 
                    placeholder="제목" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                />
                <input 
                    type="date" 
                    value={departureDate} 
                    onChange={(e) => setDepartureDate(e.target.value)} 
                />
                <input 
                    type="date" 
                    value={returnDate} 
                    min={departureDate} 
                    onChange={(e) => setReturnDate(e.target.value)} 
                />
                <div className="modal-buttons">
                    <button className="save-btn" onClick={handleSubmit}>추가</button>
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
