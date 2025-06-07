import { useState } from "react";
import {
    addChecklist,
    deleteChecklist,
    updateChecklist
} from "../../api/checklist/checklistApi";
import "./Checklist.css";
import ChecklistEditModal from "./ChecklistEditModal";
import ChecklistAddModal from "./ChecklistAddModal";
import { useAuth } from "../../contexts/AuthContext";

export default function Checklist({ onSelectChecklist, onRequireLogin, onUpdateChecklist  }) {
    const { checklists, fetchChecklists, isAuthenticated } = useAuth();
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editChecklist, setEditChecklist] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadChecklists = async () => {
        if (!isAuthenticated) {
            console.log('인증되지 않은 사용자 - 체크리스트 로드 건너뜀');
            return;
        }

        if (isLoading) {
            console.log('이미 체크리스트 로딩 중입니다.');
            return;
        }

        try {
            setIsLoading(true);
            console.log('체크리스트 수동 로딩 시작');
            await fetchChecklists();
            console.log('체크리스트 로드 완료');
        } catch (error) {
            console.error('체크리스트 로드 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddChecklist = async (title, departureDate, returnDate) => {
        if (!isAuthenticated) {
            onRequireLogin();
            return;
        }

        const success = await addChecklist({ title, departureDate, returnDate });
        if (success) {
            loadChecklists(); 
            setIsAddModalOpen(false); 
        }
    };
    
    const handleAddChecklistClick = () => {
        console.log('체크리스트 추가 버튼 클릭 - 인증 상태 확인');
        
        if (!isAuthenticated) {
            console.log('인증되지 않음 - 로그인 모달 호출');
            onRequireLogin(); 
            return;
        }
        console.log('인증됨 - 체크리스트 추가 모달 열기');
        setIsAddModalOpen(true); 
    };

    const handleUpdateChecklist = async (id, updatedData) => {
        if (!isAuthenticated) {
            onRequireLogin();
            return;
        }

        const success = await updateChecklist(id, updatedData);
        if (success) {
            loadChecklists(); 
            setEditChecklist(null);
            const updatedChecklist = { id, ...updatedData };
            setSelectedChecklist(updatedChecklist);
            onUpdateChecklist(updatedChecklist);
        }
    };

    const handleDeleteChecklist = async (id) => {
        if (!isAuthenticated) {
            onRequireLogin();
            return;
        }

        if (window.confirm("체크리스트에 포함된 모든 데이터가 삭제됩니다.\n 체크리스트를 삭제하시겠습니까?")) {
            const success = await deleteChecklist(id);
            if (success) {
                loadChecklists();
                if (selectedChecklist && selectedChecklist.id === id) {
                    setSelectedChecklist(null); 
                    onSelectChecklist(null);
                }
            }
        }
    };

    return (
        <div className="checklist-container">
            <h2>체크리스트</h2>
            <div className="checklist-header">
                <button className="add-btn" onClick={handleAddChecklistClick}>체크리스트 추가</button>
                {isAuthenticated && (
                    <button className="refresh-btn" onClick={loadChecklists} disabled={isLoading}>
                        {isLoading ? '새로고침 중...' : '새로고침'}
                    </button>
                )}
            </div>
            
            {isLoading && <div>체크리스트 로딩 중...</div>}
            
            <ul>
                {checklists.map((list) => (
                    <li key={list.id}>
                        <span onClick={() => {
                            setSelectedChecklist(list);
                            onSelectChecklist(list); 
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

            {checklists.length === 0 && !isLoading && isAuthenticated && (
                <div>등록된 체크리스트가 없습니다.</div>
            )}

            {!isAuthenticated && (
                <div>로그인 후 체크리스트를 이용하실 수 있습니다.</div>
            )}

            {/* 체크리스트 추가 모달 */}
            <ChecklistAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddChecklist}
                onRequireLogin={onRequireLogin}
                isAuthenticated={isAuthenticated}
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
