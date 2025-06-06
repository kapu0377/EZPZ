import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addOrUpdatePost, deletePost } from "../../api/postService";
import CommentSection from "./CommentSection";
import { checkAuthStatus, getUsernameFromRefreshToken } from "../../utils/authUtils";

const PostDetail = ({ post, isWriting, onGoToList, openLoginModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);

  // post나 isWriting이 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setEditId(post.id || null);
    } else if (isWriting) {
      setTitle("");
      setContent("");
      setEditId(null);
    }
  }, [post, isWriting]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    
    if (!checkAuthStatus().isAuthenticated) {
      alert("로그인이 필요합니다.");
      openLoginModal();
      return;
    }
    try {
      console.log("수정 ID:", editId);
      const savedPost = await addOrUpdatePost({
        editId,
        title,
        content,
      });
      
      alert(editId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.");
      
      if (editId) {
        navigate(`/board/${savedPost.id}`, { replace: true });
      } else {
        navigate("/board", { replace: true });
      }
    } catch (error) {
      console.error("게시글 저장 오류:", error);
      alert("게시글 저장에 실패했습니다. " + error.message);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      alert("게시글이 삭제되었습니다.");
      navigate("/board", { replace: true });
    } catch (error) {
      alert(error.message || "게시글 삭제에 실패했습니다.");
    }
  };

  const handleEdit = () => {
    if (!post || !post.id) return;
    navigate(`/board/edit/${post.id}`);
  };

  if (isWriting) {
    return (
      <div className="detail-section">
        <div className="post-header">
          <h2 className="post-title">{editId ? "게시글 수정" : "새 게시글 작성"}</h2>
        </div>
        <div className="post-body">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="post-title-input"
          />
          <textarea
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-content-input"
          />
        </div>
        <div className="post-buttons">
          <div className="left-buttons">
            <button
              onClick={() => {
                onGoToList();
              }}
              className="button back-button"
            >
              목록으로
            </button>
          </div>
          <div className="right-buttons">
            <button onClick={handleSubmit} className="button edit-button">
              {editId ? "수정완료" : "등록"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="detail-section">
      <div className="post-header">
        <h2 className="post-title">{post.title}</h2>
        <div className="post-info">
          <span className="post-writer">작성자: {post.writer}</span>
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="post-body">
        <div className="post-content">{post.content}</div>
      </div>
      <div className="post-buttons">
        <div className="left-buttons">
          <button onClick={onGoToList} className="button back-button">
            목록으로
          </button>
        </div>
        {post.writer === getUsernameFromRefreshToken() && checkAuthStatus().isAuthenticated && (
          <div className="right-buttons">
            <button
              onClick={() => {
                if (window.confirm("게시글을 수정하시겠습니까?")) {
                  handleEdit();
                }
              }}
              className="button edit-button"
            >
              수정
            </button>
            <button
              onClick={() => {
                if (window.confirm("정말 삭제하시겠습니까?")) {
                  handleDelete(post.id);
                }
              }}
              className="button delete-button"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <CommentSection postId={post.id} />
    </div>
  );
};

export default PostDetail;
