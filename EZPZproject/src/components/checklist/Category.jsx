import { useState, useEffect } from "react";
import { getCategoriesWithItems, addCategory, updateCategory, deleteCategory } from "../../api/checklist/categoryApi";
import { resetPacking } from "../../api/checklist/checklistApi";
import Item from "./Item";
import "./Category.css";
import CategoryAddModal from "./CategoryAddModal"; // ✅ 추가 모달

export default function Category({ checklist }) {
    const [categories, setCategories] = useState([]);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // ✅ 추가 모달 상태

    useEffect(() => {
        if (checklist) {
            loadCategories();
        }
    }, [checklist]);

    const loadCategories = async () => {
        const data = await getCategoriesWithItems(checklist.id);
        setCategories(data);
    };

    const handleAddCategory = async (categoryName) => {
        if (!categoryName.trim()) return alert("카테고리 이름을 입력하세요.");
        
        const result = await addCategory(checklist.id, categoryName);
        if (!result.success) {
            alert(result.message);  // 중복된 카테고리 알림창 표시
            return false;
        }
        loadCategories();
        return true;
    };

    const handleUpdateCategory = async (categoryId) => {
        if (!editCategoryName.trim()) return alert("카테고리 이름을 입력하세요.");
        await updateCategory(categoryId, editCategoryName);
        setEditCategoryId(null);
        loadCategories();
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("카테고리에 포함된 모든 데이터가 삭제됩니다.\n카테고리를 삭제하시겠습니까?")) {
            await deleteCategory(categoryId);
            loadCategories();
        }
    };

    const handleResetPacking = async () => {
        if (window.confirm("모든 아이템의 체크 상태를 초기화하시겠습니까?")) {
            await resetPacking(checklist.id);
            alert("짐 싸기 초기화 완료!");
            loadCategories(); // 초기화 후 카테고리 및 아이템 목록 갱신
        }
    };

    return (
        <div className="category-container">
            <h3>{checklist.title} ({checklist.departureDate} ~ {checklist.returnDate}) - 카테고리 목록</h3>
            <div className="category-buttons">
                <button className="category-add-btn" onClick={() => setIsAddModalOpen(true)}>카테고리 추가</button>
                <button className="category-reset-btn" onClick={handleResetPacking}>짐 싸기 초기화</button>
            </div>

            {/* ✅ 카테고리 목록을 2줄 그리드로 정렬 */}
            <div className="category-grid">
                {categories.map((category) => (
                    <div key={category.id} className="category-block">
                        <div className="category-title">
                            {editCategoryId === category.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdateCategory(category.id)}>저장</button>
                                    <button onClick={() => setEditCategoryId(null)}>취소</button>
                                </>
                            ) : (
                                <>
                                    <span>📌 {category.name}</span>
                                    <button className="edit-btn" onClick={() => { setEditCategoryId(category.id); setEditCategoryName(category.name); }}>수정</button>
                                    <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>삭제</button>
                                </>
                            )}
                        </div>

                        {/* ✅ 아이템 리스트 */}
                        <ul className="item-list">
                            <Item category={category} />
                        </ul>
                    </div>
                ))}
            </div>

            {/* ✅ 카테고리 추가 모달 */}
            <CategoryAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCategory}
            />
        </div>
    );
}
