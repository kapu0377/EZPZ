import React, { useState, useEffect } from "react";
import "./ChecklistEditModal.css"; // ✅ 스타일 적용

export default function ChecklistEditModal({ isOpen, onClose, checklist, onUpdate }) {
    const [title, setTitle] = useState("");
    const [departureDate, setDepartureDate] = useState("");
    const [returnDate, setReturnDate] = useState("");

    useEffect(() => {
        if (checklist) {
            setTitle(checklist.title);
            setDepartureDate(checklist.departureDate);
            setReturnDate(checklist.returnDate);
        }
    }, [checklist]);

    if (!isOpen) return null; // ✅ 모달이 열려 있을 때만 표시

    const handleSubmit = () => {
        if (!title.trim() || !departureDate.trim() || !returnDate.trim()) {
            alert("제목, 출발일, 도착일을 모두 입력하세요.");
            return;
        }
        onUpdate(checklist.id, title, departureDate, returnDate);
        onClose(); // ✅ 수정 완료 후 모달 닫기
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>체크리스트 수정</h2>
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
                    <button className="save-btn" onClick={handleSubmit}>저장</button>
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
}
