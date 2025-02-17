import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";

export default function ChecklistApi() {
    const [memberId] = useState(1); //테스트용 회원 ID
    //로그인한 사용자의 id를 동적으로 불러옴
    // const [memberId, setMemberId] = useState(null);
    // useEffect(() => {
    //     const storedMemberId = localStorage.getItem("memberId"); // 로그인한 회원 ID 불러오기
    //     if (storedMemberId) {
    //         setMemberId(storedMemberId);
    //         loadChecklists(storedMemberId);
    //     }
    // }, []);

    const [checklists, setChecklists] = useState([]);
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]); //카테고리별 아이템 저장
    const [newChecklist, setNewChecklist] = useState({ title: "", departureDate: "", returnDate: "" });
    const [editChecklist, setEditChecklist] = useState(null);
    const [editChecklistData, setEditChecklistData] = useState({ title: "", departureDate: "", returnDate: "" });
    const [editCategory, setEditCategory] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState("");
    const [newItem, setNewItem] = useState({ categoryId: null, name: "" });
    const [editItem, setEditItem] = useState(null);
    const [editItemName, setEditItemName] = useState("");


    useEffect(() => {
        loadChecklists();
    }, []);

    const loadChecklists = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/checklist/list/${memberId}`);
            setChecklists(response.data);
        } catch (error) {
            console.error("체크리스트 불러오기 실패:", error);
        }
    };

    const loadCategoriesWithItems = async (checklist) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories/list/${checklist.id}`);
            setCategories(response.data);
            setSelectedChecklist(checklist);  //checklist 전체 객체 저장

            // 카테고리별 아이템 로드
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


    const loadItems = async (categoryId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/items/list/${categoryId}`);
            setItems((prevItems) => ({ ...prevItems, [categoryId]: response.data }));
        } catch (error) {
            console.error("아이템 불러오기 실패:", error);
        }
    };

    const handleAddChecklist = async () => {
        if (!newChecklist.title.trim() || !newChecklist.departureDate.trim() || !newChecklist.returnDate.trim()) {
            alert("제목,가는날,오는날을 모두 입력해주세요.");
            return;
        }
        if (window.confirm("체크리스트를 추가하시겠습니까?")) {
            try {
                await axios.post(`${API_BASE_URL}/checklist/`, newChecklist, { params: { memberId } });
                setNewChecklist({ title: "", departureDate: "", returnDate: "" });
                window.alert("추가 성공");
                loadChecklists();
            } catch (error) {
                console.error("체크리스트 추가 실패:", error);
            }
        }
    };

    const handleEditChecklist = (checklist) => {
        setEditChecklist(checklist.id);
        setEditChecklistData({
            title: checklist.title,
            departureDate: checklist.departureDate,
            returnDate: checklist.returnDate,
        });
    };

    // 출발일 변경 시, 도착일의 min 값 업데이트
    const handleEditDepartureDateChange = (e) => {
        const newDepartureDate = e.target.value;
        setEditChecklistData((prev) => ({
            ...prev,
            departureDate: newDepartureDate,
            returnDate: prev.returnDate, // 초기화 없이 유지
        }));
    };

    const handleUpdateChecklist = async (id) => {
        try {
            await axios.put(`${API_BASE_URL}/checklist/${id}`, editChecklistData, { params: { memberId } });
            setEditChecklist(null);
            loadChecklists();
        } catch (error) {
            console.error("체크리스트 수정 실패:", error);
        }
    };

    // 출발일이 도착일보다 늦지 않도록 자동 보정
    const handleDepartureDateChange = (e) => {
        const newDepartureDate = e.target.value;
        setNewChecklist((prev) => ({
            ...prev,
            departureDate: newDepartureDate,
            returnDate: prev.returnDate && prev.returnDate < newDepartureDate ? "" : prev.returnDate
        }));
    };

    const handleDeleteChecklist = async (id) => {
        if (window.confirm("체크리스트 안의 모든 데이터가 삭제됩니다. 정말 삭제하시겠습니까?")) {
            try {
                await axios.delete(`${API_BASE_URL}/checklist/${id}`, { params: { memberId } });
                window.alert("삭제 성공");
                setCategories([]);
                setItems({});
                setSelectedChecklist(null);
                loadChecklists();
            } catch (error) {
                console.error("체크리스트 삭제 실패:", error);
            }
        }
    };


    const handleAddCategory = async () => {
        if (!selectedChecklist || !selectedChecklist.id) {
            alert("체크리스트를 먼저 선택하세요.");
            return;
        }
        const categoryName = prompt("새로운 카테고리 이름을 입력하세요:");
        if (categoryName) {
            try {
                await axios.post(`${API_BASE_URL}/categories/${selectedChecklist.id}`, { name: categoryName });
                window.alert("추가 성공")
                loadCategoriesWithItems(selectedChecklist);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    alert("이미 존재하는 카테고리입니다.");
                } else {
                    console.error("카테고리 추가 실패:", error);
                }
            }
        };
    }

    const handleEditCategory = (category) => {
        setEditCategory(category.id);
        setEditCategoryName(category.name);
    };

    const handleUpdateCategory = async (categoryId) => {
        if (!editCategoryName.trim()) {
            alert("카테고리명을 입력해주세요.");
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/categories/${categoryId}`, { name: editCategoryName });

            setEditCategory(null);
            loadCategoriesWithItems(selectedChecklist);
            alert("카테고리명이 수정되었습니다.");
        } catch (error) {
            console.error("카테고리 수정 실패:", error);
            alert("카테고리 수정에 실패했습니다.");
        }
    };

    const handleDeleteCategory = async (categoryId, checklistId) => {
        if (window.confirm("해당 카테고리안의 모든 아이템이 삭제됩니다. 정말 삭제하시겠습니까?")) {
            try {
                await axios.delete(`${API_BASE_URL}/categories/${categoryId}`);
                window.alert("카테고리 삭제 성공");
                loadCategoriesWithItems(checklistId);
            } catch (error) {
                console.error("카테고리 삭제 실패:", error);
            }
        }
    };

    const handleToggleItemCheck = async (itemId, checked) => {
        try {
            await axios.put(`${API_BASE_URL}/items/${itemId}/checked`, { checked: !checked });
            loadCategoriesWithItems(selectedChecklist); //카테고리별 아이템 목록 리랜더링
        } catch (error) {
            console.error("아이템 체크 상태 변경 실패:", error);
        }
    };

    const handleAddItem = async (categoryId) => {
        if (!newItem.name.trim()) {
            alert("아이템 이름을 입력해주세요.");
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/items/${categoryId}`, { name: newItem.name });
            setNewItem({ categoryId: null, name: "" });
            loadItems(categoryId);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                alert("이미 존재하는 아이템입니다.");
            } else {
                console.error("아이템 추가 실패:", error);
            }
        }
    };

    const handleEditItem = (item) => {
        setEditItem(item.id);
        setEditItemName(item.name);
    };

    const handleUpdateItem = async (itemId, categoryId) => {
        if (!editItemName.trim()) {
            alert("아이템 이름을 입력해주세요.");
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/items/${itemId}`, { name: editItemName });
            setEditItem(null);
            loadItems(categoryId);
        } catch (error) {
            console.error("아이템 수정 실패:", error);
        }
    };

    const handleCancelAddItem = () => {
        setNewItem({ categoryId: null, name: "" });
    };

    const handleDeleteItem = async (itemId, categoryId) => {
        if (window.confirm("아이템을 삭제하시겠습니까?")) {
            try {
                await axios.delete(`${API_BASE_URL}/items/${itemId}`);
                loadItems(categoryId);
            } catch (error) {
                console.error("아이템 삭제 실패:", error);
            }
        }
    };

    const handleResetPacking = async () => {
        if (!selectedChecklist) return;
        if (!window.confirm("모든 아이템의 체크 상태를 해제하시겠습니까?")) return;
        try {
            await axios.put(`${API_BASE_URL}/checklist/${selectedChecklist.id}/reset`);
            loadCategoriesWithItems(selectedChecklist);
        } catch (error) {
            console.error("짐 싸기 초기화 실패:", error);
        }
    };


    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
            <h1></h1>
            <div className="space-y-2">
                제목 : <input type="text" placeholder="제목" value={newChecklist.title} onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })} className="w-full p-2 border rounded" /><br />
                여행 출발일 : <input type="date" value={newChecklist.departureDate} onChange={handleDepartureDateChange} className="w-full p-2 border rounded" /><br />
                여행 도착일 : <input type="date" value={newChecklist.returnDate} min={newChecklist.departureDate} onChange={(e) => setNewChecklist({ ...newChecklist, returnDate: e.target.value })} className="w-full p-2 border rounded" /><br />
                <button onClick={handleAddChecklist} className="w-full p-2 bg-blue-500 text-white rounded">체크리스트 추가</button>
                <h2>{memberId}님의 체크리스트 목록</h2>
            </div>
            <ul className="divide-y divide-gray-300">
                {checklists.map((checklist) => (
                    <li key={checklist.id} className="p-2 flex justify-between items-center cursor-pointer" onClick={() => loadCategoriesWithItems(checklist)}>
                        {editChecklist === checklist.id ? (
                            <div className="flex gap-2">
                                <input type="text" value={editChecklistData.title} onChange={(e) => setEditChecklistData({ ...editChecklistData, title: e.target.value })} className="w-full p-2 border rounded" />
                                <input type="date" value={editChecklistData.departureDate} onChange={(e) => setEditChecklistData({ ...editChecklistData, departureDate: e.target.value })} className="w-full p-2 border rounded" />
                                <input type="date" value={editChecklistData.returnDate} min={editChecklistData.departureDate} // 출발일보다 이전 날짜 선택 방지
                                    onChange={(e) => setEditChecklistData({ ...editChecklistData, returnDate: e.target.value })} className="w-full p-2 border rounded" />
                                <button onClick={() => handleUpdateChecklist(checklist.id)} className="p-2 bg-blue-500 text-white rounded">저장</button>
                                <button onClick={() => setEditChecklist(null)} className="p-2 bg-gray-500 text-white rounded">취소</button>
                            </div>
                        ) : (
                            <>
                                <span>{checklist.title} ({checklist.departureDate} ~ {checklist.returnDate})</span>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditChecklist(checklist); }} className="p-1 bg-yellow-500 text-white rounded">수정</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChecklist(checklist.id, checklist.title); }} className="p-1 text-red-500">삭제</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
            {selectedChecklist && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold">{selectedChecklist ? `${selectedChecklist.title}의 카테고리별 아이템 목록` : "카테고리별 아이템 목록"}</h2>
                    <button onClick={handleAddCategory} className="w-full p-2 bg-blue-500 text-white rounded">카테고리 추가</button>
                    <button onClick={handleResetPacking} className="p-2 bg-red-500 text-white rounded">짐 싸기 초기화</button>
                    <ul className="divide-y divide-gray-300">
                        {categories.map((category) => (
                            <li key={category.id} className="p-2 cursor-pointer" onClick={() => loadItems(category.id)}>
                                {/* <span className="font-bold">{category.name}</span> */}
                                {editCategory === category.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editCategoryName}
                                            onChange={(e) => setEditCategoryName(e.target.value)}
                                            className="w-full p-2 border rounded"
                                        />
                                        <button onClick={() => handleUpdateCategory(category.id)} className="p-2 bg-blue-500 text-white rounded">수정</button>
                                        <button onClick={() => setEditCategory(null)} className="p-2 bg-gray-500 text-white rounded">취소</button>
                                        <button onClick={() => handleDeleteCategory(category.id, selectedChecklist)} className="p-2 bg-gray-500 text-white rounded">삭제</button>
                                    </div>
                                ) : (
                                    <span onClick={() => handleEditCategory(category)}>{category.name}</span>
                                )}
                                <button onClick={() => setNewItem({ categoryId: category.id, name: "" })} className="p-2 bg-green-500 text-white rounded">아이템 추가</button>
                                {newItem.categoryId === category.id && (
                                    <div className="flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            value={newItem.name}
                                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            className="w-full p-2 border rounded"
                                        />
                                        <button onClick={() => handleAddItem(category.id)} className="p-2 bg-blue-500 text-white rounded">+</button>
                                        <button onClick={handleCancelAddItem} className="p-2 bg-red-500 text-white rounded">-</button>
                                    </div>
                                )}
                                {items[category.id] && (
                                    <ul className="ml-4 mt-2 list-disc">
                                        {items[category.id].map((item) => (
                                            <li key={item.id} className="flex justify-between items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.checked}
                                                    onChange={() => handleToggleItemCheck(item.id, item.checked)}
                                                />
                                                {editItem === item.id ? (
                                                    <div className="flex gap-2">

                                                        <input
                                                            type="text"
                                                            value={editItemName}
                                                            onChange={(e) => setEditItemName(e.target.value)}
                                                            className="w-full p-2 border rounded"
                                                        />
                                                        <button onClick={() => handleUpdateItem(item.id, category.id)} className="p-2 bg-blue-500 text-white rounded">아이템 수정</button>
                                                        <button onClick={() => handleDeleteItem(item.id, category.id)} className="p-1 text-red-500">아이템 삭제</button>
                                                    </div>
                                                ) : (
                                                    <span onClick={() => handleEditItem(item)}>{item.name}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
