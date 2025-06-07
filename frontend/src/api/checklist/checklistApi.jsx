import axiosInstance from "../../utils/axios";

// 체크리스트 목록 가져오기
export const getChecklists = async () => {
    try {
        const response = await axiosInstance.get('/checklist/list');
        return response.data;
    } catch (error) {
        // console.error("체크리스트 불러오기 실패:", error.response ? error.response.data : error.message);
        return [];
    }
};

// 체크리스트 추가
export const addChecklist = async (newChecklist) => {
    try {
        await axiosInstance.post('/checklist/', newChecklist);
        return true;
    } catch (error) {
        console.error("체크리스트 추가 실패:", error.response ? error.response.data : error.message);
        return false;
    }
};

// 체크리스트 수정
export const updateChecklist = async (id, checklistData) => {
    try {
        await axiosInstance.put(`/checklist/${id}`, checklistData);
        return true;
    } catch (error) {
        console.error("체크리스트 수정 실패:", error.response ? error.response.data : error.message);
        return false;
    }
};

// 체크리스트 삭제
export const deleteChecklist = async (id) => {
    try {
        await axiosInstance.delete(`/checklist/${id}`);
        return true;
    } catch (error) {
        console.error("체크리스트 삭제 실패:", error.response ? error.response.data : error.message);
        return false;
    }
};

// 짐 싸기 초기화
export const resetPacking = async (checklistId) => {
    try {
        await axiosInstance.put(`/checklist/${checklistId}/reset`, null);
        return true;
    } catch (error) {
        console.error("짐 싸기 초기화 실패:", error.response ? error.response.data : error.message);
        return false;
    }
};
