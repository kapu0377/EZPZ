import React, { useState } from "react";

const ChecklistList = ({ checklists, onSelect, onAdd, onUpdate, onDelete, memberId }) => {
    const [editingChecklistId, setEditingChecklistId] = useState(null);
    const [editChecklistData, setEditChecklistData] = useState({ title: "", departureDate: "", returnDate: "" });
    const [newChecklist, setNewChecklist] = useState({ title: "", departureDate: "", returnDate: "" });

    // ✅ 체크리스트 수정 시작 (input 필드 활성화)
    const handleEditChecklistStart = (checklist) => {
        setEditingChecklistId(checklist.id);
        setEditChecklistData({ ...checklist });
    };

    // ✅ 수정 취소 (원래 값으로 리셋)
    const handleCancelEdit = () => {
        setEditingChecklistId(null);
        setEditChecklistData({ title: "", departureDate: "", returnDate: "" });
    };

    // ✅ 출발일 선택 시 도착일 제한
    const handleDepartureDateChange = (e) => {
        const newDepartureDate = e.target.value;
        setNewChecklist((prev) => ({
            ...prev,
            departureDate: newDepartureDate,
            returnDate: prev.returnDate && prev.returnDate < newDepartureDate ? newDepartureDate : prev.returnDate
        }));
    };

    // ✅ 체크리스트 추가
    const handleAddChecklist = () => {
        if (!newChecklist.title.trim() || !newChecklist.departureDate || !newChecklist.returnDate) {
            alert("제목, 가는 날, 오는 날을 모두 입력해주세요.");
            return;
        }
        onAdd(memberId, newChecklist);
        setNewChecklist({ title: "", departureDate: "", returnDate: "" });
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">체크리스트 추가</h2>
            <div className="flex flex-col gap-2">
                <input 
                    type="text" 
                    placeholder="제목" 
                    value={newChecklist.title} 
                    onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })} 
                    className="p-2 border rounded" 
                />
                <input 
                    type="date" 
                    value={newChecklist.departureDate} 
                    onChange={handleDepartureDateChange} 
                    className="p-2 border rounded" 
                />
                <input 
                    type="date" 
                    value={newChecklist.returnDate} 
                    min={newChecklist.departureDate} 
                    onChange={(e) => setNewChecklist({ ...newChecklist, returnDate: e.target.value })} 
                    className="p-2 border rounded" 
                />
                <button onClick={handleAddChecklist} className="p-2 bg-blue-500 text-white rounded">체크리스트 추가</button>
            </div>

            <h2 className="text-lg font-semibold mt-4">체크리스트 목록</h2>
            <ul className="divide-y divide-gray-300">
                {checklists.map((checklist) => (
                    <li key={checklist.id} className="p-2 flex justify-between items-center cursor-pointer" onClick={() => onSelect(checklist)}>
                        {editingChecklistId === checklist.id ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={editChecklistData.title}
                                    onChange={(e) => setEditChecklistData({ ...editChecklistData, title: e.target.value })}
                                    className="p-2 border rounded w-40"
                                />
                                <input
                                    type="date"
                                    value={editChecklistData.departureDate}
                                    onChange={(e) => setEditChecklistData({ ...editChecklistData, departureDate: e.target.value })}
                                    className="p-2 border rounded"
                                />
                                <input
                                    type="date"
                                    value={editChecklistData.returnDate}
                                    min={editChecklistData.departureDate}
                                    onChange={(e) => setEditChecklistData({ ...editChecklistData, returnDate: e.target.value })}
                                    className="p-2 border rounded"
                                />
                                <button onClick={() => onUpdate(checklist.id, editChecklistData, memberId)} className="p-2 bg-green-500 text-white rounded">저장</button>
                                <button onClick={handleCancelEdit} className="p-2 bg-gray-500 text-white rounded">취소</button>
                            </div>
                        ) : (
                            <>
                                <span>{checklist.title} ({checklist.departureDate} ~ {checklist.returnDate})</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditChecklistStart(checklist); }} className="p-1 bg-yellow-500 text-white rounded">수정</button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(checklist.id, memberId); }} className="p-1 bg-red-500 text-white rounded">삭제</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChecklistList;
