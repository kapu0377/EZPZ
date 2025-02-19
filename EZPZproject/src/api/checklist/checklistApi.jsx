import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";
const MEMBER_ID = 1; // 고정된 memberId

export const getChecklists = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/checklist/list/${MEMBER_ID}`);
        return response.data;
    } catch (error) {
        console.error("체크리스트 불러오기 실패:", error);
        return [];
    }
};

export const addChecklist = async (newChecklist) => {
    try {
        await axios.post(`${API_BASE_URL}/checklist/`, newChecklist, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 추가 실패:", error);
        return false;
    }
};

export const updateChecklist = async (id, checklistData) => {
    try {
        await axios.put(`${API_BASE_URL}/checklist/${id}`, checklistData, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 수정 실패:", error);
        return false;
    }
};

export const deleteChecklist = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/checklist/${id}`, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 삭제 실패:", error);
        return false;
    }
};

export const resetPacking = async (checklistId) => {
    try {
        await axios.put(`${API_BASE_URL}/checklist/${checklistId}/reset`);
        return true;
    } catch (error) {
        console.error("짐 싸기 초기화 실패:", error);
        return false;
    }
};
