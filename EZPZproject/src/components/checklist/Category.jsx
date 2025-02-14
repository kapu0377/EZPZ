import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

export default function Category({ category, loadCategoriesWithItems }) {
  const handleDeleteCategory = async () => {
    if (!window.confirm("카테고리를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/categories/${category.id}`);
      loadCategoriesWithItems();
    } catch (error) {
      console.error("카테고리 삭제 실패:", error);
    }
  };

  return (
    <div>
      <span>{category.name}</span>
      <button onClick={handleDeleteCategory}>삭제</button>
    </div>
  );
}
