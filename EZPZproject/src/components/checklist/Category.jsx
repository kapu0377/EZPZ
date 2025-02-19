import { useState, useEffect } from "react";
import { getCategoriesWithItems, addCategory, updateCategory, deleteCategory } from "../../api/checklist/categoryApi";
import { resetPacking } from "../../api/checklist/checklistApi";
import Item from "./Item";
import "./Category.css";

export default function Category({ checklist }) {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    useEffect(() => {
        loadCategories();
    }, [checklist]);

    const loadCategories = async () => {
        if (!checklist) return;
        const data = await getCategoriesWithItems(checklist.id);
        setCategories(data);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return alert("카테고리 이름을 입력하세요.");
        
        const result = await addCategory(checklist.id, newCategoryName);
        if (!result.success) {
            alert(result.message); // 중복된 카테고리 알림창 표시
            return;
        }
        setNewCategoryName("");
        loadCategories();
    };


    const handleUpdateCategory = async (categoryId) => {
        if (!editCategoryName.trim()) return alert("카테고리 이름을 입력하세요.");
        await updateCategory(categoryId, editCategoryName);
        setEditCategoryId(null);
        loadCategories();
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("카테고리를 삭제하시겠습니까?")) {
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
            <h3>{checklist.title} - 카테고리 목록</h3>
            <input
                type="text"
                placeholder="새 카테고리 이름"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button onClick={handleAddCategory}>추가</button>
            <button onClick={handleResetPacking}>짐 싸기 초기화</button>
            <ul>
            {categories.map((category) => (
                    <li key={category.id} className="category-block">
                        {/* ✅ 카테고리명 (위쪽 배치) */}
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
                                    <span>{category.name}</span>
                                    <button onClick={() => { setEditCategoryId(category.id); setEditCategoryName(category.name); }}>수정</button>
                                    <button onClick={() => handleDeleteCategory(category.id)}>삭제</button>
                                </>
                            )}
                        </div>

                        {/* ✅ 아이템 리스트 */}
                        <ul className="item-list">
                            <Item category={category} />
                        </ul>
                    </li>
                ))}
            </ul>
            
        </div>
    );
}
