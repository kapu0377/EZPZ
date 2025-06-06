import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import PostList from "../components/PostList";
import PostDetail from "../components/PostDetail";
import Login from "../components/Login";
import { getPostDetail } from "../services/postService";
import { checkAuthStatus } from "../../utils/authUtils";

const BoardPage = () => {
  const navigate = useNavigate();
  const { no } = useParams();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (no) {
      fetchSelectedPost(no);
      setIsDetailView(true);
    } else {
      setIsDetailView(false);
      setSelectedPost(null);
      setIsWriting(false);
    }
  }, [no]);

  const fetchSelectedPost = async (postId) => {
    try {
      const data = await getPostDetail(postId);
      setSelectedPost(data);
    } catch (error) {
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
    if (!checkAuthStatus().isAuthenticated) {
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
    <div className="notice-container">
      {!isDetailView ? (
        <PostList onAddClick={handleAddClick} />
      ) : (
        <PostDetail
          post={selectedPost}
          isWriting={isWriting}
          onGoToList={handleGoToList}
          openLoginModal={() => setIsLoginModalOpen(true)}
        />
      )}

      <Login
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default BoardPage;
