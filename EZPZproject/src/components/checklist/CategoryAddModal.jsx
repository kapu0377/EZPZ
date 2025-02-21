import React, { useState } from "react";
import "./CategoryAddModal.css";

export default function CategoryAddModal({ isOpen, onClose, onAdd }) {
    const [categoryName, setCategoryName] = useState("");

    if (!isOpen) return null; // 모달이 열려 있을 때만 표시

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            alert("카테고리 이름을 입력하세요.");
            return;
        }

        const success = await onAdd(categoryName);
        if (success) {
            setCategoryName("");
            onClose(); // 추가 후 모달 닫기
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>새 카테고리 추가</h2>
                <input 
                    type="text" 
                    placeholder="카테고리 이름" 
                    value={categoryName} 
                    onChange={(e) => setCategoryName(e.target.value)} 
                />
                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="save-btn" onClick={handleSubmit}>추가</button>
                </div>
            </div>
        </div>
    );
}
