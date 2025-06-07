import { useState, useEffect } from "react";
import { getCategoriesWithItems, addCategory, updateCategory, deleteCategory } from "../../api/checklist/categoryApi";
import { addItem } from "../../api/checklist/checklist_itemApi";
import { resetPacking } from "../../api/checklist/checklistApi";
import { defaultCategories } from "../../api/checklist/defaultCategories";
import Item from "./Item";
import "./Category.css";
import CategoryAddModal from "./CategoryAddModal";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes } from "react-icons/fa";  //수정,삭제,저장,취소 아이콘

export default function Category({ checklist }) {
    const [categories, setCategories] = useState([]);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // 추가 모달 상태
    const [isEditMode, setIsEditMode] = useState(false); // 편집 모드 추가

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

    // 기본 카테고리 추가 함수
    const handleAddDefaultCategories = async () => {
        if(window.confirm("기본 카테고리를 추가하시겠습니까?")) {
            for (const category of defaultCategories) {
                // 기존 카테고리에 동일한 이름이 있으면 추가하지 않음
                const existingCategory = categories.find(cat => cat.name === category.name);
                if (!existingCategory) {
                    const addedCategory = await addCategory(checklist.id, category.name);
                    if (addedCategory.success) {
                        const newCategories = await getCategoriesWithItems(checklist.id);
                        const newCategory = newCategories.find(cat => cat.name === category.name);
    
                        // 기본 아이템 추가
                        if (newCategory) {
                            for (const itemName of category.items) {
                                await addItem(newCategory.id, itemName);
                            }
                        }
                    }
                }
            }
            loadCategories();
        }
    };

    return (
        <div className="category-container">
            <h3 className="category-list-title">{checklist.title} ({checklist.departureDate} ~ {checklist.returnDate}) - 카테고리&아이템 목록</h3>
            <div className="category-buttons">
                <button className="category-add-btn" onClick={() => setIsAddModalOpen(true)}>카테고리 추가</button>
                <button className="category-reset-btn" onClick={handleResetPacking}>짐 싸기 초기화</button>
                {/* 편집 모드 버튼 추가 */}
                <button 
                    className={`edit-mode-btn ${isEditMode ? "active" : ""}`} 
                    onClick={() => setIsEditMode(!isEditMode)}
                >
                    {isEditMode ? "편집 완료" : "편집 모드"}
                </button>
            </div>

            {/* 카테고리 목록을 2줄 그리드로 정렬 */}
            <div className="category-grid">
                {categories.map((category) => (
                    <div key={category.id} className="category-block">
                        <div className="checklist-category-title">
                            {editCategoryId === category.id ? (
                                <>
                                    <input className="category-edit-input"
                                        type="text"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                    />
                                    <button onClick={() => handleUpdateCategory(category.id)}><FaCheck /></button>
                                    <button onClick={() => setEditCategoryId(null)}><FaTimes /></button>
                                </>
                            ) : (
                                <>
                                    <span>📌 {category.name}</span>
                                    {/* 편집 모드일 때만 수정/삭제 버튼 표시 */}
                                    {isEditMode && (
                                        <div className="category-btn-group">
                                            <button className="category-edit-btn" onClick={() => { setEditCategoryId(category.id); setEditCategoryName(category.name); }}><FaEdit /></button>
                                            <button className="category-delete-btn" onClick={() => handleDeleteCategory(category.id)}><FaTrashAlt /></button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* 아이템 리스트 */}
                        <ul className="item-list">
                            <Item category={category} isEditMode={isEditMode} />
                        </ul>
                    </div>
                ))}
            </div>

            {/* 기본 카테고리 추가 버튼 */}
            <div className="category-default-container">
                <button className="category-default-btn" onClick={handleAddDefaultCategories}>기본 카테고리 추가</button>
            </div>

            {/* 카테고리 추가 모달 */}
            <CategoryAddModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddCategory}
            />
        </div>
    );
}
