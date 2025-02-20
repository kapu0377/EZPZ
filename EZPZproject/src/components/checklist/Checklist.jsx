import { useState, useEffect } from "react";
import {
    getChecklists,
    addChecklist,
    deleteChecklist,
    updateChecklist
} from "../../api/checklist/checklistApi";
import "./Checklist.css";
import ChecklistAddModal from "./ChecklistAddModal";
import ChecklistEditModal from "./ChecklistEditModal";

export default function Checklist({ onSelectChecklist }) {
    const [checklists, setChecklists] = useState([]);
    const [newChecklist, setNewChecklist] = useState({ title: "", departureDate: "", returnDate: "" });
    const [editChecklistId, setEditChecklistId] = useState(null);
    const [editChecklistData, setEditChecklistData] = useState({ title: "", departureDate: "", returnDate: "" });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // ✅ 추가 모달 열림 상태 관리
    const [editChecklist, setEditChecklist] = useState(null); // ✅ 수정 모달 상태



    useEffect(() => {
        loadChecklists();
    }, []);

    const loadChecklists = async () => {
        const data = await getChecklists();
        setChecklists(data);
    };

    // 체크리스트 추가
    const handleAddChecklist = async (title, departureDate, returnDate) => {
        console.log("Checklist.jsx에서 받은 제목:", title);
        console.log("Checklist.jsx에서 받은 출발일:", departureDate);
        console.log("Checklist.jsx에서 받은 도착일:", returnDate);
    
        const newChecklist = { title, departureDate, returnDate };
    
        if (!newChecklist.title?.trim() || !newChecklist.departureDate || !newChecklist.returnDate) {
            return alert("제목, 출발일, 도착일을 모두 입력하세요.");
        }
    
        await addChecklist(newChecklist);
        loadChecklists();
        setIsAddModalOpen(false); // 모달 닫기
    };
    

    // 체크리스트 수정 모드 활성화
    const handleEditChecklist = (checklist) => {
        setEditChecklistId(checklist.id);
        setEditChecklistData({
            title: checklist.title,
            departureDate: checklist.departureDate,
            returnDate: checklist.returnDate,
        });
    };

    // 체크리스트 업데이트
    const handleUpdateChecklist = async (id) => {
        if (!editChecklistData.title.trim()) return alert("제목을 입력하세요.");
        await updateChecklist(id, editChecklistData);
        setEditChecklistId(null);
        loadChecklists();
    };

    // 체크리스트 삭제
    const handleDeleteChecklist = async (id) => {
        if (window.confirm("체크리스트를 삭제하시겠습니까?")) {
            await deleteChecklist(id);
            loadChecklists();
        }
    };

    return (
        <div className="checklist-container">
            <h2>체크리스트</h2>
            
            {/* <input type="text" placeholder="제목" value={newChecklist.title} onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })} />
            <input type="date" value={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, departureDate: e.target.value })} />
            <input type="date" value={newChecklist.returnDate} min={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, returnDate: e.target.value })} /> */}
            {/* <button onClick={handleAddChecklist}>추가</button> */}
            <button onClick={() => setIsAddModalOpen(true)}>체크리스트 추가</button>
            <ul>
                {checklists.map((list) => (
                    <li key={list.id}>
                        {editChecklistId === list.id ? (
                            <>
                                <input type="text" value={editChecklistData.title} onChange={(e) => setEditChecklistData({ ...editChecklistData, title: e.target.value })} />
                                <input type="date" value={editChecklistData.departureDate} onChange={(e) => setEditChecklistData({ ...editChecklistData, departureDate: e.target.value })} />
                                <input type="date" value={editChecklistData.returnDate} min={editChecklistData.departureDate} onChange={(e) => setEditChecklistData({ ...editChecklistData, returnDate: e.target.value })} />
                                <button onClick={() => handleUpdateChecklist(list.id)}>저장</button>
                                <button onClick={() => setEditChecklistId(null)}>취소</button>
                            </>
                        ) : (
                            <>
                                <span onClick={() => onSelectChecklist(list)}>
                                    {list.title} ({list.departureDate} ~ {list.returnDate})
                                </span>
                                <div className="checklist-buttons">
                                    {/* <button className="edit-btn" onClick={() => handleEditChecklist(list)}>수정</button> */}
                                    <button className="edit-btn" onClick={() => setEditChecklist(list)}>수정</button>
                                    <button className="delete-btn" onClick={() => handleDeleteChecklist(list.id)}>삭제</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            {/* ✅ 체크리스트 추가 모달 */}
            <ChecklistAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddChecklist}
            />
             {/* ✅ 체크리스트 수정 모달 */}
             <ChecklistEditModal 
                isOpen={!!editChecklist} 
                onClose={() => setEditChecklist(null)}
                checklist={editChecklist} 
                onUpdate={handleUpdateChecklist}
            />
        </div>
    );
}
