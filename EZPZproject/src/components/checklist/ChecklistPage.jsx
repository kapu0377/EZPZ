import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles.css"; // ✅ 개별 컴포넌트에서도 import 가능


const API_BASE_URL = "http://localhost:8080/api";

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState([]);
  const [newChecklist, setNewChecklist] = useState({ title: "", departureDate: "", returnDate: "" });
  const navigate = useNavigate();
  const memberId = 1; // 테스트용 ID

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checklist/list/${memberId}`);
      setChecklists(response.data);
    } catch (error) {
      console.error("체크리스트 불러오기 실패:", error);
    }
  };

  const handleAddChecklist = async () => {
    if (!newChecklist.title.trim() || !newChecklist.departureDate || !newChecklist.returnDate) {
      alert("모든 필드를 입력하세요.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/checklist/`, newChecklist, { params: { memberId } });
      setNewChecklist({ title: "", departureDate: "", returnDate: "" });
      loadChecklists();
    } catch (error) {
      console.error("체크리스트 추가 실패:", error);
    }
  };

  const handleDeleteChecklist = async (id) => {
    if (!window.confirm("체크리스트를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/checklist/${id}`, { params: { memberId } });
      loadChecklists();
    } catch (error) {
      console.error("체크리스트 삭제 실패:", error);
    }
  };

  return (
    <div className="checklist-container">
      <h2>체크리스트</h2>
      <input type="text" placeholder="제목" value={newChecklist.title} onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })} />
      <input type="date" value={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, departureDate: e.target.value })} />
      <input type="date" value={newChecklist.returnDate} onChange={(e) => setNewChecklist({ ...newChecklist, returnDate: e.target.value })} />
      <button onClick={handleAddChecklist}>추가</button>

      <ul>
        {checklists.map((checklist) => (
          <li key={checklist.id} onClick={() => navigate(`/checklist/${checklist.id}`)}>
            {checklist.title} ({checklist.departureDate} ~ {checklist.returnDate})
            <button onClick={(e) => { e.stopPropagation(); handleDeleteChecklist(checklist.id); }}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
