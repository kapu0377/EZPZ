import React, { useEffect, useState } from "react";
import { fetchPosts, createPost, updatePost, deletePost } from "../api/postApi";
import PostForm from "../components/PostForm";
import PostList from "../components/PostList";

const BoardPage = () => {
  
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await fetchPosts();
    setPosts(data);
  };

  return (
    <div>
      <h1>📌 게시판</h1>
      <PostForm onSubmit={createPost} />
      <PostList posts={posts} onDelete={deletePost} />
    </div>
  );
};

export default BoardPage;
