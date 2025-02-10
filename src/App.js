import PostForm from './components/PostForm'
import React, {useState} from 'react';
import './App.css';
import Notice from './notice/Notice'; 

function App() {
  
  return (
    <div className="App">
      <Notice /> 
    </div>
  );
}
const API_URL = "http://localhost:8080/api/posts";

export const fetchPosts = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const createPost = async (post) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  return response.json();
};

export const updatePost = async (id, post) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  });
  return response.json();
};

export const deletePost = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};
export default App;
