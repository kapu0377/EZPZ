import { useState, useEffect } from "react";
import {
    getChecklists,
    addChecklist,
    deleteChecklist,
    updateChecklist
} from "../../api/checklist/checklistApi";
import "./Checklist.css";
import ChecklistEditModal from "./ChecklistEditModal";
import ChecklistAddModal from "./ChecklistAddModal";
import { useAuth } from "../../contexts/AuthContext";

export default function Checklist({ onSelectChecklist, onRequireLogin, onUpdateChecklist  }) {
    const { checklists, fetchChecklists } = useAuth();
    // const [checklists, setChecklists] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState(null); // 현재 선택된 체크리스트
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editChecklist, setEditChecklist] = useState(null);

    useEffect(() => {
        loadChecklists();
    }, []);

    const loadChecklists = async () => {
        const data = await getChecklists();
        fetchChecklists(data);
    };

    // 체크리스트 추가
    const handleAddChecklist = async (title, departureDate, returnDate) => {
        const success = await addChecklist({ title, departureDate, returnDate });
        if (success) {
            loadChecklists(); // 목록 갱신
            setIsAddModalOpen(false); // 모달 닫기
        }
    };
    // 체크리스트 추가 버튼 클릭시 로그인 여부 확인
    const handleAddChecklistClick = () => {
        const token = localStorage.getItem("accessToken");

        if (!token) {
            onRequireLogin(); // 로그인 필요 시 부모(Main.jsx)의 로그인 모달 호출
            return;
        }
        setIsAddModalOpen(true); // 토큰이 있으면 체크리스트 추가 모달 열기
    };

    // 체크리스트 수정
    const handleUpdateChecklist = async (id, updatedData) => {
        const success = await updateChecklist(id, updatedData);
        if (success) {
            loadChecklists(); // 목록 갱신
            setEditChecklist(null); // 수정 모달 닫기
            //수정된 체크리스트 업데이트
            const updatedChecklist = { id, ...updatedData };
            setSelectedChecklist(updatedChecklist);
            onUpdateChecklist(updatedChecklist);
        }
    };

    // 체크리스트 삭제 (카테고리도 함께 초기화)
    const handleDeleteChecklist = async (id) => {
        if (window.confirm("체크리스트에 포함된 모든 데이터가 삭제됩니다.\n 체크리스트를 삭제하시겠습니까?")) {
            const success = await deleteChecklist(id);
            if (success) {
                fetchChecklists(checklists.filter((checklist) => checklist.id !== id)); // UI에서 삭제 반영
                if (selectedChecklist && selectedChecklist.id === id) {
                    setSelectedChecklist(null); // 선택된 체크리스트 초기화 (카테고리 목록 숨김)
                    onSelectChecklist(null); // 부모 컴포넌트로 빈 값 전달하여 카테고리 목록 숨김
                }
            }
        }
    };

    return (
        <div className="checklist-container">
            <h2>체크리스트</h2>
            <button className="add-btn" onClick={handleAddChecklistClick}>체크리스트 추가</button>
            <ul>
                {checklists.map((list) => (
                    <li key={list.id}>
                        <span onClick={() => {
                            setSelectedChecklist(list);
                            onSelectChecklist(list); // 선택된 체크리스트 업데이트
                        }}>
                            <div>
                            {list.title}
                            </div>
                             ({list.departureDate} ~ {list.returnDate})
                        </span>
                        <div className="checklist-buttons">
                            <button className="edit-btn" onClick={() => setEditChecklist(list)}>수정</button>
                            <button className="delete-btn" onClick={() => handleDeleteChecklist(list.id)}>삭제</button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* 체크리스트 추가 모달 */}
            <ChecklistAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddChecklist}
                onRequireLogin={onRequireLogin}
            />

            {/* 체크리스트 수정 모달 */}
            {editChecklist && (
                <ChecklistEditModal 
                    isOpen={!!editChecklist} 
                    onClose={() => setEditChecklist(null)}
                    checklist={editChecklist} 
                    onUpdate={handleUpdateChecklist}
                />
            )}
        </div>
    );
}
