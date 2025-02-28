import React, { useEffect, useState } from "react";
import { getComments as getCommentsByPostId, createComment as addComment, updateComment as editComment, deleteComment } from "../../api/commentApi";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("accessToken"));
  const commentsPerPage = 4;

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    checkLoginStatus();

    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
    };

    const handleLogout = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout', handleLogout);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout', handleLogout);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentLoginStatus = !!localStorage.getItem("accessToken");
      if (isLoggedIn !== currentLoginStatus) {
        setIsLoggedIn(currentLoginStatus);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn]);

  const fetchComments = async () => {
    try {
      const data = await getCommentsByPostId(postId);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    try {
      await addComment(postId, commentText);
      setCommentText("");
      setCurrentCommentPage(1);
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.message);
    }
  };

  const handleEditButtonClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleEditComment = async () => {
    if (!editCommentText.trim()) return;
    try {
      await editComment(editingCommentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText("");
      fetchComments();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(commentId);
      fetchComments();
      alert("댓글이 삭제되었습니다.");
    } catch (error) {
      alert(error.message);
    }
  };

  const indexOfLastComment = currentCommentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalCommentPages = Math.ceil(comments.length / commentsPerPage);

  const handleCommentPageChange = (pageNumber) => {
    setCurrentCommentPage(pageNumber);
  };

  return (
    <div className="comments-section">
      <h3>댓글 ({comments.length})</h3>
      {isLoggedIn ? (
        <div className="comment-form">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="comment-input"
          />
          <button onClick={handleAddComment} className="comment-submit">
            등록
          </button>
        </div>
      ) : (
        <div className="login-required-message">
          <p>댓글을 작성하려면 <span className="login-required-highlight">로그인</span>이 필요합니다.</p>
        </div>
      )}
      <div className="comments-list">
        {currentComments.map((comment) => (
          <div key={comment.id} className="comment-item">
            {editingCommentId === comment.id ? (
              <div className="comment-edit-form">
                <input
                  type="text"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className="comment-input"
                />
                <div className="comment-edit-buttons">
                  <button
                    onClick={handleEditComment}
                    className="button edit-button"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditCommentText("");
                    }}
                    className="button cancel-button"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="comment-content">
                  <span className="comment-author">{comment.writer}</span>
                  <span className="comment-text">{comment.content}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                {comment.writer === localStorage.getItem("username") && isLoggedIn && (
                  <div className="comment-buttons">
                    <button
                      onClick={() => handleEditButtonClick(comment)}
                      className="comment-edit"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="comment-delete"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {comments.length > 0 && (
        <div className="comment-pagination">
          <button
            onClick={() => handleCommentPageChange(currentCommentPage - 1)}
            disabled={currentCommentPage === 1}
            className="page-arrow"
          >
            &lt;
          </button>
          {[...Array(totalCommentPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handleCommentPageChange(index + 1)}
              className={`page-number ${
                currentCommentPage === index + 1 ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handleCommentPageChange(currentCommentPage + 1)}
            disabled={currentCommentPage === totalCommentPages}
            className="page-arrow"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
