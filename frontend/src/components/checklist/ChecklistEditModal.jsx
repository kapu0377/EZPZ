import React, { useState, useEffect } from "react";
import "./ChecklistEditModal.css";

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

    if (!isOpen) return null; // 모달이 열려 있을 때만 표시

    const handleSubmit = async () => {
        if (!title.trim() || !departureDate.trim() || !returnDate.trim()) {
            alert("제목, 출발일, 도착일을 모두 입력하세요.");
            return;
        }

        await onUpdate(checklist.id, { title, departureDate, returnDate });

        onClose(); // 수정 후 모달 닫기
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content2">
                <h2>체크리스트 수정</h2>
                <div className="date-input-container">
                    <label htmlFor="tour title">여행 제목</label>
                    <input id="tour title" placeholder="여행 제목을 입력해주세요." type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                    <button className="category-save-btn" onClick={handleSubmit}>저장</button>
                </div>
            </div>
        </div>
    );
}
