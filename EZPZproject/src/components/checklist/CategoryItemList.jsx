import React, { useState } from "react";

const CategoryItemList = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onUpdateItem,
  onResetPacking
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");
  const [activeCategoryForItem, setActiveCategoryForItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItemName, setEditedItemName] = useState("");

  // ✅ 아이템 추가 버튼 클릭 시 해당 카테고리 아래 input 필드 활성화
  const handleStartAddingItem = (categoryId) => {
    setActiveCategoryForItem(categoryId);
    setNewItemName("");
  };

  // ✅ 아이템 추가 함수 (중복 검사 포함)
  const handleAddItem = async (categoryId) => {
    if (!newItemName.trim()) {
      alert("아이템 이름을 입력해주세요.");
      return;
    }

    // ✅ 중복 검사 (카테고리 내부에서 같은 이름이 있는지 확인)
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.items.some(item => item.name === newItemName)) {
      alert("이미 존재하는 아이템입니다."); // 🚨 중복 아이템 경고
      return;
    }

    try {
      await onAddItem(categoryId, { name: newItemName });
      setNewItemName("");
      setActiveCategoryForItem(null); // 입력 후 닫기
    } catch (error) {
      console.error("아이템 추가 실패:", error);
    }
  };

  // ✅ 아이템 수정 시작 (input 필드 활성화)
  const handleEditItemStart = (item) => {
    setEditingItemId(item.id);
    setEditedItemName(item.name);
  };

  // ✅ 아이템 수정 완료 (중복 검사 포함)
  const handleEditItemSubmit = async (itemId, categoryId) => {
    if (!editedItemName.trim()) {
      alert("아이템 이름을 입력해주세요.");
      return;
    }

    // ✅ 중복 검사 (카테고리 내부에서 같은 이름이 있는지 확인)
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.items.some(item => item.id !== itemId && item.name === editedItemName)) {
      alert("이미 존재하는 아이템입니다."); // 🚨 중복 아이템 경고
      return;
    }

    try {
      await onUpdateItem(itemId, { name: editedItemName });
      setEditingItemId(null);
    } catch (error) {
      console.error("아이템 수정 실패:", error);
    }
  };

  // ✅ 새로운 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("카테고리 이름을 입력해주세요.");
      return;
    }
    try {
      await onAddCategory({ name: newCategoryName });
      setNewCategoryName("");
      setShowCategoryInput(false);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("이미 존재하는 카테고리입니다.");
      } else {
        console.error("카테고리 추가 실패:", error);
      }
    }
  };

  // ✅ 카테고리 수정 시작 (input 필드 활성화)
  const handleEditCategoryStart = (category) => {
    setEditingCategoryId(category.id);
    setEditedCategoryName(category.name);
  };

  // ✅ 카테고리 수정 완료 (API 호출)
  const handleEditCategorySubmit = async (categoryId) => {
    if (!editedCategoryName.trim()) {
      alert("카테고리명을 입력해주세요.");
      return;
    }
    try {
      await onEditCategory(categoryId, { name: editedCategoryName });
      setEditingCategoryId(null);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("이미 존재하는 카테고리입니다.");
      } else {
        console.error("카테고리 수정 실패:", error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">카테고리 및 아이템 목록</h2>

      {/* 카테고리 추가 버튼 및 입력 필드 */}
      {showCategoryInput ? (
        <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
          <input
            type="text"
            placeholder="카테고리 이름"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button onClick={handleAddCategory} className="p-2 bg-green-500 text-white rounded">추가</button>
          <button onClick={() => setShowCategoryInput(false)} className="p-2 bg-red-500 text-white rounded">취소</button>
        </div>
      ) : (
        <button onClick={() => setShowCategoryInput(true)} className="w-full p-2 bg-blue-500 text-white rounded my-2">
          카테고리 추가
        </button>
      )}

      {/* 짐 싸기 초기화 버튼 */}
      <button
        onClick={onResetPacking}
        className="w-full p-2 bg-red-500 text-white rounded mt-2"
      >
        짐 싸기 초기화
      </button>

      <ul className="divide-y divide-gray-300 mt-2">
        {categories.length > 0 ? (
          categories.map((category) => (
            <li key={category.id} className="p-2">
              <div className="flex justify-between items-center">
                {/* ✅ 카테고리 이름 클릭 시 input으로 변경 */}
                {editingCategoryId === category.id ? (
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEditCategorySubmit(category.id)}
                    className="w-full p-2 border rounded"
                  />
                ) : (
                  <span
                    className="font-bold cursor-pointer hover:text-blue-500"
                    onClick={() => handleEditCategoryStart(category)}
                  >
                    {category.name}
                  </span>
                )}
                <div>
                  {/* ✅ 수정 버튼 (input 상태에서는 '저장'으로 변경) */}
                  {editingCategoryId === category.id ? (
                    <>
                      <button onClick={() => handleEditCategorySubmit(category.id)} className="p-1 bg-green-500 text-white rounded ml-2">저장</button>
                      <button onClick={() => setEditingCategoryId(null)} className="p-1 bg-gray-500 text-white rounded ml-2">취소</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditCategoryStart(category)} className="p-1 bg-yellow-500 text-white rounded">수정</button>
                      <button onClick={() => onDeleteCategory(category.id)} className="p-1 bg-red-500 text-white rounded ml-2">삭제</button>
                    </>
                  )}
                </div>
              </div>

              {/* 아이템 목록 */}
              <ul className="ml-4 mt-2 list-disc">
                {category.items.length > 0 ? (
                  category.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={item.checked} onChange={() => onToggleItem(item.id, item.checked)} />

                        {/* ✅ 아이템명 클릭 시 input으로 변경 */}
                        {editingItemId === item.id ? (
                          <input
                            type="text"
                            value={editedItemName}
                            onChange={(e) => setEditedItemName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleEditItemSubmit(item.id, category.id)}
                            className="w-full p-2 border rounded"
                          />
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-500"
                            onClick={() => handleEditItemStart(item)}
                          >
                            {item.name}
                          </span>
                        )}
                      </div>

                      <div>
                        {/* ✅ 수정 버튼 (input 상태에서는 '저장'으로 변경) */}
                        {editingItemId === item.id ? (
                          <>
                            <button onClick={() => handleEditItemSubmit(item.id, category.id)} className="p-1 bg-green-500 text-white rounded ml-2">저장</button>
                            <button onClick={() => setEditingItemId(null)} className="p-1 bg-gray-500 text-white rounded ml-2">취소</button>
                          </>
                        ) : (
                          <button onClick={() => onDeleteItem(item.id)} className="p-1 text-red-500">삭제</button>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 ml-4">아이템 없음</p>
                )}
              </ul>
              {/* ✅ 아이템 추가 input 필드 */}
              {activeCategoryForItem === category.id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="아이템 이름"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem(category.id)}
                    className="w-full p-2 border rounded"
                  />
                  <button onClick={() => handleAddItem(category.id)} className="p-2 bg-green-500 text-white rounded">추가</button>
                  <button onClick={() => setActiveCategoryForItem(null)} className="p-2 bg-gray-500 text-white rounded">취소</button>
                </div>
              ) : (
                <button onClick={() => handleStartAddingItem(category.id)} className="mt-2 p-1 bg-green-500 text-white rounded">
                  아이템 추가
                </button>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-500">카테고리가 없습니다.</p>
        )}
      </ul>
    </div>
  );
};

export default CategoryItemList;
