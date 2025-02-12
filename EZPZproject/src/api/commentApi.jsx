const API_BASE_URL = 'http://localhost:8080/api';

export const getComments = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

export const createComment = async (postId, content, writer) => {
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, writer }),
  });
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
};

export const updateComment = async (commentId, content, writer) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, writer }),
  });
  if (!response.ok) throw new Error('Failed to update comment');
  return response.json();
};

export const deleteComment = async (commentId, writer) => {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}?writer=${writer}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete comment');
}; 