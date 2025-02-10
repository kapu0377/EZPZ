import axios from "axios";

const API_URL = "http://localhost:8080/api/posts";

export const createPost = async (title, content) => {
  try {
    const response = await axios.post(API_URL, { title, content });
    console.log("게시글 추가 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("게시글 추가 실패:", error);
    return error;
  }
};
export const updatePost = async (id, title, content) => {
  try {
    const response = await axios.put(API_URL+"/"+id, { title, content });
    console.log("게시글 수정 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("게시글 수정 실패:", error);
    return error;
  }
};
export const deletePost = async (id) => {
  try {
    const response = await axios.delete(API_URL+"/"+id);
    console.log("게시글 삭제 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    return error;
  }
  
};