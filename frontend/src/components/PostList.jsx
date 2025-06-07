import React from "react";

const PostList = ({ posts, onEdit, onDelete }) => {
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <button onClick={() => onEdit(post)}>수정</button>
          <button onClick={() => onDelete(post.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
};

export default PostList;
