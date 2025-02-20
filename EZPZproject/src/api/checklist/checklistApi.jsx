import axios from "axios";

const API_BASE_URL = "http://localhost:8088/api";
const MEMBER_ID = 1; // 고정된 memberId

// Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 인증 쿠키 전송 허용
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 시 Authorization 헤더 자동 추가
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 체크리스트 목록 조회
export const getChecklists = async () => {
    try {
        const response = await axiosInstance.get(`/checklist/list/${MEMBER_ID}`);
        return response.data;
    } catch (error) {
        console.error("체크리스트 불러오기 실패:", error);
        return [];
    }
};

// 체크리스트 추가
export const addChecklist = async (newChecklist) => {
    try {
        await axiosInstance.post(`/checklist/`, newChecklist, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 추가 실패:", error);
        return false;
    }
};

// 체크리스트 수정
export const updateChecklist = async (id, checklistData) => {
    try {
        await axiosInstance.put(`/checklist/${id}`, checklistData, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 수정 실패:", error);
        return false;
    }
};

// 체크리스트 삭제
export const deleteChecklist = async (id) => {
    try {
        await axiosInstance.delete(`/checklist/${id}`, { params: { memberId: MEMBER_ID } });
        return true;
    } catch (error) {
        console.error("체크리스트 삭제 실패:", error);
        return false;
    }
};

// 짐 싸기 초기화
export const resetPacking = async (checklistId) => {
    try {
        await axiosInstance.put(`/checklist/${checklistId}/reset`);
        return true;
    } catch (error) {
        console.error("짐 싸기 초기화 실패:", error);
        return false;
    }
};
