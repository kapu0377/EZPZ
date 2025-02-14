import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export default function Item({ categoryId, items, loadCategoriesWithItems }) {
  const handleToggleCheck = async (itemId, checked) => {
    try {
      await axios.put(`${API_BASE_URL}/items/${itemId}/checked`, { checked: !checked });
      loadCategoriesWithItems();
    } catch (error) {
      console.error("체크 상태 변경 실패:", error);
    }
  };

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(item.id, item.checked)} />
          {item.name}
        </li>
      ))}
    </ul>
  );
}
