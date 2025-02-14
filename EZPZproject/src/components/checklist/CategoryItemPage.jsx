import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Category from "./Category";
import Item from "./Item";

const API_BASE_URL = "http://localhost:8080/api";

export default function CategoryItemPage() {
  const { checklistId } = useParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadCategoriesWithItems();
  }, [checklistId]);

  const loadCategoriesWithItems = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/list/${checklistId}`);
      setCategories(response.data);

      const itemsData = {};
      await Promise.all(
        response.data.map(async (category) => {
          const itemResponse = await axios.get(`${API_BASE_URL}/items/list/${category.id}`);
          itemsData[category.id] = itemResponse.data;
        })
      );
      setItems(itemsData);
    } catch (error) {
      console.error("카테고리 및 아이템 불러오기 실패:", error);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>뒤로가기</button>
      <h2>카테고리 및 아이템 관리</h2>

      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Category category={category} loadCategoriesWithItems={loadCategoriesWithItems} />
            <Item categoryId={category.id} items={items[category.id] || []} loadCategoriesWithItems={loadCategoriesWithItems} />
          </li>
        ))}
      </ul>
    </div>
  );
}
