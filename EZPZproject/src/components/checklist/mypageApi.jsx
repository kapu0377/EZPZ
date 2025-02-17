import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";

// 🔹 체크리스트 관련 API
export const getChecklists = (memberId) => 
    axios.get(`${API_BASE_URL}/checklist/list/${memberId}`);

export const addChecklist = (memberId, checklist) => 
    axios.post(`${API_BASE_URL}/checklist/`, checklist, { params: { memberId } });

export const updateChecklist = (id, checklist, memberId) => 
    axios.put(`${API_BASE_URL}/checklist/${id}`, checklist, { params: { memberId } });

export const deleteChecklist = (id, memberId) => 
    axios.delete(`${API_BASE_URL}/checklist/${id}`, { params: { memberId } });

export const resetChecklistItems = (checklistId) => 
    axios.put(`${API_BASE_URL}/checklist/${checklistId}/reset`);

// 🔹 카테고리 및 아이템을 함께 가져오는 API
export const getCategoriesWithItems = async (checklistId) => {
    try {
        const categoryResponse = await axios.get(`${API_BASE_URL}/categories/list/${checklistId}`);
        const categories = categoryResponse.data;

        // 각 카테고리에 대한 아이템 가져오기 (병렬 요청)
        const itemsRequests = categories.map(async (category) => {
            const itemResponse = await axios.get(`${API_BASE_URL}/items/list/${category.id}`);
            return { ...category, items: itemResponse.data };
        });

        return await Promise.all(itemsRequests);
    } catch (error) {
        console.error("카테고리 및 아이템 불러오기 실패:", error);
        throw error;
    }
};

// 🔹 카테고리 관련 API
export const addCategory = (checklistId, category) => 
    axios.post(`${API_BASE_URL}/categories/${checklistId}`, category);

export const updateCategory = (categoryId, category) => 
    axios.put(`${API_BASE_URL}/categories/${categoryId}`, category);

export const deleteCategory = (categoryId) => 
    axios.delete(`${API_BASE_URL}/categories/${categoryId}`);

// 🔹 아이템 관련 API
export const addItem = (categoryId, item) => 
    axios.post(`${API_BASE_URL}/items/${categoryId}`, item);

export const updateItem = (itemId, item) => 
    axios.put(`${API_BASE_URL}/items/${itemId}`, item);

export const deleteItem = (itemId) => 
    axios.delete(`${API_BASE_URL}/items/${itemId}`);

export const toggleItemCheck = (itemId, checked) => 
    axios.put(`${API_BASE_URL}/items/${itemId}/checked`, { checked });
