import React, { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import PostList from "../components/board/PostList";
import PostDetail from "../components/board/PostDetail";
import Login from "../components/Login";
import { getPostDetail } from "../api/postService";
import { checkAuthStatus } from "../utils/authUtils";

function BoardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    
    if (path.includes('/write')) {
      setIsWriting(true);
      setIsDetailView(true);
      setSelectedPost(null);
    } else if (path.includes('/edit/')) {
      const postId = path.split('/').pop();
      fetchSelectedPost(postId, true);
      setIsDetailView(true);
      setIsWriting(true);
    } else if (path.match(/\/board\/\d+/)) {
      const postId = path.split('/').pop();
      fetchSelectedPost(postId, false);
      setIsDetailView(true);
      setIsWriting(false);
    } else if (path === '/board') {
      setIsDetailView(false);
      setSelectedPost(null);
      setIsWriting(false);
    }
  }, [location.pathname]);

  const fetchSelectedPost = async (postId, isEdit = false) => {
    try {
      const data = await getPostDetail(postId);
      setSelectedPost(data);
      if (isEdit) {
        setIsWriting(true);
      }
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
      navigate("/board");
    }
  };

  const handleGoToList = () => {
    setIsDetailView(false);
    setSelectedPost(null);
    setIsWriting(false);
    navigate("/board");
  };

  const handleAddClick = () => {
    const authStatus = checkAuthStatus();
    if (!authStatus.isAuthenticated) {
      alert("로그인이 필요한 서비스입니다.\n로그인 후 다시 이용해주세요.");
      setIsLoginModalOpen(true);
      return;
    }
    setIsWriting(true);
    setSelectedPost(null);
    setIsDetailView(true);
    navigate("/board/write");
  };

  return (
    <>
      <div style={{ minHeight: 'calc(100vh - 300px)' }}>
        <Routes>
          <Route
            path="/"
            element={
              <PostList onAddClick={handleAddClick} />
            }
          />
          <Route
            path="/:id"
            element={
              <PostDetail
                post={selectedPost}
                isWriting={false}
                onGoToList={handleGoToList}
                openLoginModal={() => setIsLoginModalOpen(true)}
              />
            }
          />
          <Route
            path="/write"
            element={
              <PostDetail
                post={null}
                isWriting={true}
                onGoToList={handleGoToList}
                openLoginModal={() => setIsLoginModalOpen(true)}
              />
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PostDetail
                post={selectedPost}
                isWriting={true}
                onGoToList={handleGoToList}
                openLoginModal={() => setIsLoginModalOpen(true)}
              />
            }
          />
        </Routes>
      </div>

      <Login
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

export default BoardPage;
