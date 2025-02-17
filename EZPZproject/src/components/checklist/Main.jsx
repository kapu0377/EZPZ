import { useState, useEffect } from "react";
import { 
    getChecklists, addChecklist, updateChecklist, deleteChecklist, 
    getCategoriesWithItems, addCategory, updateCategory, deleteCategory,
    addItem, updateItem, deleteItem, toggleItemCheck, resetChecklistItems 
} from "./mypageApi";
import ChecklistList from "./ChecklistList";
import CategoryItemList from "./CategoryItemList";

export default function ChecklistApi() {
    const [memberId] = useState(1);
    const [checklists, setChecklists] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => { loadChecklists(); }, []);

    const loadChecklists = async () => {
        const response = await getChecklists(memberId);
        setChecklists(response.data);
    };

    const loadCategoriesWithItems = async (checklist) => {
        const categoryData = await getCategoriesWithItems(checklist.id);
        setCategories(categoryData);
        setSelectedChecklist(checklist);
    };

    // 체크리스트 추가
    const handleAddChecklist = async (newChecklist) => {
        if (!newChecklist.title.trim() || !newChecklist.departureDate.trim() || !newChecklist.returnDate.trim()) {
            alert("제목, 가는 날, 오는 날을 모두 입력해주세요.");
            return;
        }
    
        try {
            await addChecklist(newChecklist);
            loadChecklists();
        } catch (error) {
            console.error("체크리스트 추가 실패:", error);
        }
    };
    
    // 체크리스트 수정
    const handleUpdateChecklist = async (id, updatedChecklist) => {
        try {
            await updateChecklist(id, updatedChecklist);
            loadChecklists();
        } catch (error) {
            console.error("체크리스트 수정 실패:", error);
        }
    };
    
    
    // 체크리스트 삭제
    const handleDeleteChecklist = async (id) => {
        if (window.confirm("체크리스트 안의 모든 데이터가 삭제됩니다. 정말 삭제하시겠습니까?")) {
            try {
                await deleteChecklist(id);
                loadChecklists();
            } catch (error) {
                console.error("체크리스트 삭제 실패:", error);
            }
        }
    };
    

    // 카테고리 추가
    const handleAddCategory = async (category) => {
        if (!selectedChecklist) return;
    
        try {
            await addCategory(selectedChecklist.id, category);
            loadCategoriesWithItems(selectedChecklist);
        } catch (error) {
            if (error.response && error.response.status === 400) {  // 서버에서 400 에러 응답 시
                alert("이미 존재하는 카테고리입니다.");  // 🚨 경고창 띄우기
            } else {
                console.error("카테고리 추가 실패:", error);
            }
        }
    };
    

    // 카테고리 수정
    const handleEditCategory = async (categoryId, updatedCategory) => {
        try {
            await updateCategory(categoryId, updatedCategory);
            loadCategoriesWithItems(selectedChecklist);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("이미 존재하는 카테고리입니다.");  // 🚨 경고창 띄우기
            } else {
                console.error("카테고리 수정 실패:", error);
            }
        }
    };
    

    // 카테고리 삭제
    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm("카테고리를 삭제하시겠습니까?")) {
            await deleteCategory(categoryId);
            loadCategoriesWithItems(selectedChecklist);
        }
    };

    // 아이템 추가
    const handleAddItem = async (categoryId, item) => {
        try {
            await addItem(categoryId, item);
            loadCategoriesWithItems(selectedChecklist);
        } catch (error) {
            if (error.response && error.response.status === 400) {  
                alert("이미 존재하는 아이템입니다.");  // 🚨 경고창 띄우기
            } else {
                console.error("아이템 추가 실패:", error);
            }
        }
    };
    
    

    // 아이템 수정
    const handleUpdateItem = async (itemId, updatedItem) => {
        try {
            await updateItem(itemId, updatedItem);
            loadCategoriesWithItems(selectedChecklist);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert("이미 존재하는 아이템입니다.");  // 🚨 경고창 띄우기
            } else {
                console.error("아이템 수정 실패:", error);
            }
        }
    };
    

    // 아이템 삭제
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("아이템을 삭제하시겠습니까?")) {
            await deleteItem(itemId);
            loadCategoriesWithItems(selectedChecklist);
        }
    };

    // 아이템 체크 상태 변경 (짐싸기 체크)
    const handleToggleItemCheck = async (itemId, checked) => {
        await toggleItemCheck(itemId, !checked);
        loadCategoriesWithItems(selectedChecklist);
    };

    // 모든 아이템 체크 해제 (짐 싸기 초기화)
    const handleResetPacking = async () => {
        if (window.confirm("모든 체크박스를 해제하시겠습니까?")) {
            await resetChecklistItems(selectedChecklist.id);
            loadCategoriesWithItems(selectedChecklist);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
            {/* 체크리스트 목록 */}
            <ChecklistList 
                checklists={checklists} 
                onSelect={loadCategoriesWithItems} 
                onAdd={handleAddChecklist} 
                onUpdate={handleUpdateChecklist} 
                onDelete={handleDeleteChecklist} 
            />

            {selectedChecklist && (
                <>
                    {/* 카테고리 및 아이템 목록 */}
                    <CategoryItemList 
                        categories={categories}
                        onAddCategory={handleAddCategory}
                        onEditCategory={handleEditCategory} 
                        onDeleteCategory={handleDeleteCategory}
                        onToggleItem={handleToggleItemCheck}
                        onDeleteItem={handleDeleteItem}
                        onAddItem={handleAddItem}
                        onUpdateItem={handleUpdateItem}
                        onResetPacking={handleResetPacking}
                    />

                </>
            )}
        </div>
    );
}
