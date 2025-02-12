import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api/checklist";

export default function ChecklistApp() {
  const [memberId] = useState(1); // 테스트용 회원 ID
  const [checklists, setChecklists] = useState([]);
  const [title, setTitle] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [editingChecklist, setEditingChecklist] = useState(null);
  
  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/list/${memberId}`);
      setChecklists(response.data);
    } catch (error) {
      console.error("체크리스트 불러오기 실패:", error);
    }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    const newChecklist = { title, departureDate, returnDate };
    try {
      await axios.post(`${API_BASE_URL}/`, newChecklist, { params: { memberId } });
      setTitle("");
      setDepartureDate("");
      setReturnDate("");
      loadChecklists();
    } catch (error) {
      console.error("체크리스트 추가 실패:", error);
    }
  };

  const handleDeleteChecklist = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, { params: { memberId } });
      setChecklists(checklists.filter((checklist) => checklist.id !== id));
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  const handleEditChecklist = (checklist) => {
    setEditingChecklist(checklist);
    setTitle(checklist.title);
    setDepartureDate(checklist.departureDate);
    setReturnDate(checklist.returnDate);
  };

  const handleUpdateChecklist = async (e) => {
    e.preventDefault();
    if (!editingChecklist) return;
    const updatedChecklist = { title, departureDate, returnDate };
    try {
      await axios.put(`${API_BASE_URL}/${editingChecklist.id}`, updatedChecklist, { params: { memberId } });
      setEditingChecklist(null);
      setTitle("");
      setDepartureDate("");
      setReturnDate("");
      loadChecklists();
    } catch (error) {
      console.error("체크리스트 수정 실패:", error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold">여행 체크리스트</h1>
      <Link to="/mypage" className="text-blue-500 underline">마이페이지</Link>
      <form onSubmit={editingChecklist ? handleUpdateChecklist : handleAddChecklist} className="space-y-2">
        <input 
          type="text" 
          placeholder="제목" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full p-2 border rounded"
          required 
        />
        <input 
          type="date" 
          value={departureDate} 
          onChange={(e) => setDepartureDate(e.target.value)} 
          className="w-full p-2 border rounded"
          required 
        />
        <input 
          type="date" 
          value={returnDate} 
          onChange={(e) => setReturnDate(e.target.value)} 
          className="w-full p-2 border rounded"
          required 
        />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          {editingChecklist ? "수정" : "추가"}
        </button>
      </form>
      <ul className="divide-y divide-gray-300">
        {checklists.map((checklist) => (
          <li key={checklist.id} className="flex justify-between p-2">
            <span>{checklist.title} ({checklist.departureDate} ~ {checklist.returnDate})</span>
            <div>
              <button 
                onClick={() => handleEditChecklist(checklist)} 
                className="p-1 text-blue-500 mr-2"
              >수정</button>
              <button 
                onClick={() => handleDeleteChecklist(checklist.id)} 
                className="p-1 text-red-500"
              >삭제</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
