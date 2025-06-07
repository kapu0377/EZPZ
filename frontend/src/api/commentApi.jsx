import { checkAuthStatus, getCookie, getUsernameFromRefreshToken } from '../utils/authUtils';

const API_BASE_URL = '/api';

export const getComments = async (postId) => {
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
};

export const createComment = async (postId, content) => {
  const authStatus = checkAuthStatus();
  const token = getCookie('accessToken');
  const username = getUsernameFromRefreshToken();
  
  if (!authStatus.isAuthenticated || !username) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify({ content, writer: username }),
  });
  if (!response.ok) throw new Error('Failed to create comment');
  return response.json();
};

export const updateComment = async (commentId, content) => {
  const authStatus = checkAuthStatus();
  const token = getCookie('accessToken');
  const username = getUsernameFromRefreshToken();
  
  if (!authStatus.isAuthenticated || !username) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify({ content, writer: username }),
  });
  if (!response.ok) throw new Error('Failed to update comment');
  return response.json();
};

export const deleteComment = async (commentId) => {
  const authStatus = checkAuthStatus();
  const token = getCookie('accessToken');
  const username = getUsernameFromRefreshToken();
  
  if (!authStatus.isAuthenticated || !username) {
    throw new Error('로그인이 필요합니다.');
  }
  
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}?writer=${username}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete comment');
};