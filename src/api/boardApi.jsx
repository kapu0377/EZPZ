import axiosInstance from '../utils/axios';

const boardApi = {
  getPosts: async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`/board?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      throw error;
    }
  },

  getPost: async (id) => {
    try {
      const response = await axiosInstance.get(`/board/${id}`);
      return response.data;
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await axiosInstance.post('/board', postData);
      return response.data;
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      throw error;
    }
  },

  updatePost: async (id, postData) => {
    try {
      const response = await axiosInstance.put(`/board/${id}`, postData);
      return response.data;
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  },

  deletePost: async (id) => {
    try {
      const response = await axiosInstance.delete(`/board/${id}`);
      return response.data;
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      throw error;
    }
  }
};

export default boardApi; 