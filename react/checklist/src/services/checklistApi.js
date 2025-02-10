const API_URL = 'http://localhost:8080/api/checklist';

// ✅ 항목 추가
export const addChecklistItem = async (category, item, isChecked = false) => {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, item, isChecked })
  });
};

// ✅ 체크 상태 업데이트
export const updateChecklistItem = async (id, isChecked) => {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isChecked })
  });
};

// ✅ 항목 삭제
export const deleteChecklistItem = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};
