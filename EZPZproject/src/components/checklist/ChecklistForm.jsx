import { useState } from "react";

const ChecklistForm = ({ onAdd }) => {
    const [newChecklist, setNewChecklist] = useState({ title: "", departureDate: "", returnDate: "" });

    const handleAddChecklist = () => {
        if (!newChecklist.title.trim() || !newChecklist.departureDate || !newChecklist.returnDate) {
            alert("제목, 가는 날, 오는 날을 모두 입력해주세요.");
            return;
        }
        onAdd(newChecklist);
        setNewChecklist({ title: "", departureDate: "", returnDate: "" });
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">체크리스트 추가</h2>
            <div className="flex flex-col gap-2">
                <input type="text" placeholder="제목" value={newChecklist.title} onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })} className="p-2 border rounded" />
                <input type="date" value={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, departureDate: e.target.value })} className="p-2 border rounded" />
                <input type="date" value={newChecklist.returnDate} min={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, returnDate: e.target.value })} className="p-2 border rounded" />
                <button onClick={handleAddChecklist} className="p-2 bg-blue-500 text-white rounded">체크리스트 추가</button>
            </div>
        </div>
    );
};

export default ChecklistForm;
