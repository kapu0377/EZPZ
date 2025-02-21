import { useState, useEffect } from "react";
import { getItems, addItem, updateItem, deleteItem, toggleItemCheck } from "../../api/checklist/checklist_itemApi";
import "./Item.css"

export default function Item({ category, isEditMode }) {
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState("");
    const [editItemId, setEditItemId] = useState(null);
    const [editItemName, setEditItemName] = useState("");

    useEffect(() => {
        loadItems();
    }, [category]);

    const loadItems = async () => {
        const data = await getItems(category.id);
        setItems(data);
    };
    //아이템 추가
    const handleAddItem = async () => {
        if (!newItemName.trim()) return alert("아이템 이름을 입력하세요.");

        const result = await addItem(category.id, newItemName);
        if (!result.success) {
            alert(result.message); // 중복된 아이템 알림창 표시
            return;
        }
        setNewItemName("");
        loadItems();
    };
    //아이템 수정
    const handleUpdateItem = async (itemId) => {
        if (!editItemName.trim()) return alert("아이템 이름을 입력하세요.");
        await updateItem(itemId, editItemName);
        setEditItemId(null);
        loadItems();
    };
    //아이템 삭제
    const handleDeleteItem = async (itemId) => {
        if (window.confirm("아이템을 삭제하시겠습니까?")) {
            await deleteItem(itemId);
            loadItems();
        }
    };
    //체크상태 변경
    const handleToggleCheck = async (itemId, checked) => {
        await toggleItemCheck(itemId, checked);
        loadItems();
    };

    return (
        <div className="item-container">
            
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleCheck(item.id, item.checked)}
                        />
                        {editItemId === item.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editItemName}
                                    onChange={(e) => setEditItemName(e.target.value)}
                                />
                                <button onClick={() => handleUpdateItem(item.id)}>저장</button>
                                <button onClick={() => setEditItemId(null)}>취소</button>
                            </>
                        ) : (
                            <>
                                <span>{item.name}</span>
                                {/* 편집 모드일 때만 수정/삭제 버튼 표시 */}
                                {isEditMode && (
                                    <>
                                        <button onClick={() => { setEditItemId(item.id); setEditItemName(item.name); }}>수정</button>
                                        <button onClick={() => handleDeleteItem(item.id)}>삭제</button>
                                    </>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
             {/* 아이템 추가 창을 편집 모드에서만 표시 */}
             {isEditMode && (
                <div className="item-add-container">
                    <input
                        type="text"
                        placeholder="새 아이템 이름"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                    />
                    <button onClick={handleAddItem}>추가</button>
                </div>
            )}
        </div>
    );
}
