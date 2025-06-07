import React, { useState } from "react";
import {createPost} from "../api/postApi";

const PostForm = ({ onPostAdded }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await createPost(title, content);
      alert("게시글이 추가되었습니다!");
      setTitle("");
      setContent("");
      onPostAdded(); 
    } catch (error) {
      alert("게시글 추가 실패!");
    }
  };

  return (
    <div>
      <h2>새 게시글 추가</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="내용" value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="submit">추가</button>
      </form>
    </div>
  );
};

export default PostForm;
