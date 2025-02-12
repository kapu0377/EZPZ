import React, { useState, useEffect } from "react";
import {createPost, updatePost, deletePost} from "../api/postApi";
<<<<<<< HEAD
import '../components/board/Notice.css';
=======
import '../notice/Notice.css';
import { getComments, createComment, updateComment, deleteComment } from '../api/commentApi';
>>>>>>> notice

const App = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('currentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const postsPerPage = 10; // 페이지당 게시글 수
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, postId: null });
  const [searchType, setSearchType] = useState('title'); // 검색 타입 상태
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 입력값
  const [activeSearch, setActiveSearch] = useState(""); // 실제 검색에 사용될 값
  const [isDetailView, setIsDetailView] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  // 검색 실행 함수
  const handleSearch = () => {
    setActiveSearch(searchTerm);
  };

  // 검색 필터 수정 (activeSearch 사용)
  const filteredPosts = posts.filter(post => {
    const searchLower = activeSearch.toLowerCase();
    switch (searchType) {
      case 'title':
        return post.title.toLowerCase().includes(searchLower);
      case 'writer':
        return (post.writer || '').toLowerCase().includes(searchLower);
      case 'content':
        return post.content.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  // 페이지네이션 처리
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 페이지 번호 배열 생성
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    localStorage.setItem('currentPage', pageNumber.toString());
  };

  // 컴포넌트가 언마운트되거나 다른 페이지로 이동할 때 현재 페이지 저장
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage.toString());
  }, [currentPage]);

  // 게시글 목록 불러오기
  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8088/api/posts');  // API 엔드포인트 주소
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
    }
  };

  // 컴포넌트 마운트 시 게시글 목록 불러오기
  useEffect(() => {
    fetchPosts();
  }, []);

  // 글쓰기 버튼 클릭 핸들러 수정
  const handleAddClick = () => {
    setTitle("");  // 제목 초기화
    setContent("");  // 내용 초기화
    setEditId(null);  // 수정 ID 초기화
    setIsWriting(true);
    setIsDetailView(true);
    setSelectedPost(null);  // 선택된 게시글 초기화
  };

  // 게시글 등록/수정 함수
  const addOrUpdatePost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
  
    try {
      const url = editId 
        ? `http://localhost:8088/api/posts/${editId}`
        : 'http://localhost:8088/api/posts';
      
      // POST 요청 데이터 구조 수정
      const postData = {
        title: title,
        content: content,
        writer: "작성자",
        createdAt: new Date().toISOString(), // 날짜 추가
        viewCount: 0,  // 조회수 초기값
        // 필요한 경우 추가 필드
      };
  
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      if (!response.ok) {
        // 에러 응답 내용 확인
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save post');
      }
      const savedPost = await response.json();
    
      // 게시글 목록 업데이트
      if (editId) {
        // 수정의 경우 해당 게시글만 업데이트
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === editId ? savedPost : post
          )
        );
      } else {
        // 새 게시글 추가의 경우 목록 맨 위에 추가
        setPosts(prevPosts => [savedPost, ...prevPosts]);
      }
      alert(editId ? '게시글이 수정되었습니다.' : '게시글이 등록되었습니다.');
      setIsWriting(false);
      setTitle("");
      setContent("");
      setEditId(null);
      setSelectedPost(null);  // 선택된 게시글 초기화
      setIsDetailView(false); // 상세 보기 모드 해제
    } catch (error) {
      console.error('Error details:', error);
      alert('게시글 저장에 실패했습니다. ' + error.message);
    }
  };

  // 게시글 삭제 후 목록 새로고침
  const removePost = async (id) => {
    try {
      await deletePost(id);
      // 삭제 후 목록 새로고침
      fetchPosts();
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const editPost = (id) => {
    const post = posts.find(post => post.id === id);
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setEditId(id);
      setIsWriting(true);
    }
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handleBackButton = (e) => {
      if (isDetailView) {
        e.preventDefault();
        setIsDetailView(false);
        setSelectedPost(null);
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [isDetailView]);

  // 게시글 상세보기로 이동할 때
  const handleViewPost = (post) => {
    setSelectedPost(post);
    setIsDetailView(true);
    window.history.pushState(null, '', window.location.pathname);
  };

  // 삭제 확인 모달 표시 함수
  const handleDeleteClick = (id) => {
    setDeleteConfirm({ show: true, postId: id });
  };

  // 삭제 확인
  const confirmDelete = async () => {
    if (deleteConfirm.postId) {
      await removePost(deleteConfirm.postId);
      setDeleteConfirm({ show: false, postId: null });
    }
  };

  // 댓글 관련 함수들 추가
  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:8088/api/comments/post/${selectedPost.id}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:8088/api/comments/post/${selectedPost.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          writer: '작성자' // 실제로는 로그인한 사용자 정보를 사용
        }),
      });

      if (response.ok) {
        setCommentText('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`http://localhost:8088/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // useEffect로 댓글 불러오기
  useEffect(() => {
    if (selectedPost) {
      fetchComments();
    }
  }, [selectedPost]);

  // 게시글 삭제 함수 추가
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8088/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('게시글이 삭제되었습니다.');
        setIsDetailView(false);
        fetchPosts(); // 게시글 목록 새로고침
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="container">
      {!isDetailView ? (
        // 게시글 목록 화면
        <div className="left-section">
          <h2 className="title">자유 게시판</h2>
          
          <div className="search-box">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="search-select"
            >
              <option value="title">제목</option>
              <option value="writer">작성자</option>
              <option value="content">내용</option>
            </select>
            <input
              type="text"
              placeholder={`${
                searchType === 'title' ? '제목' : 
                searchType === 'writer' ? '작성자' : '내용'
              } 검색...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="search-input"
            />
            <button 
              onClick={handleSearch}
              className="search-button"
            >
              검색
            </button>
            <button 
              onClick={handleAddClick}
              className="add-button"
              title="글쓰기"
            >
              글쓰기
            </button>
          </div>

          <div className="items-list">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
        <thead>
          <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-center w-16">No</th>
                    <th className="px-4 py-2 text-center flex-1">제목</th>
                    <th className="px-4 py-2 text-center w-24">작성자</th>
                    <th className="px-4 py-2 text-center w-24">날짜</th>
          </tr>
        </thead>
        <tbody>
                  {currentPosts.map((post, index) => (
                    <tr key={post.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{filteredPosts.length - ((currentPage - 1) * postsPerPage + index)}</td>
                      <td className="px-4 py-2">
                        <span 
                          onClick={() => handleViewPost(post)}
                          className="title-link title-ellipsis"
                          title={post.title}
                        >
                          {post.title.length > 15 ? post.title.slice(0, 15) + '...' : post.title}
                        </span>
                      </td>
                      <td className="px-4 py-2">작성자</td>
                      <td className="px-4 py-2">{new Date().toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>
          </div>

          <div className="pagination">
            <span 
              className="page-arrow" 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            >
              &lt;
            </span>
            {pageNumbers.map(number => (
              <span
                key={number}
                className={`page-number ${currentPage === number ? 'active' : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </span>
            ))}
            <span 
              className="page-arrow" 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            >
              &gt;
            </span>
          </div>
      </div>
      ) : (
        // 글작성/상세보기 화면
        <div className="detail-section">
          {isWriting ? (
            // 글작성 화면
            <>
              <div className="post-header">
                <h2 className="post-title">새 글 작성</h2>
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
                      setIsWriting(false);
                      setIsDetailView(false);
                      setTitle("");
                      setContent("");
                    }} 
                    className="button back-button"
                  >
                    목록으로
                  </button>
                </div>
                <div className="right-buttons">
                  <button 
                    onClick={addOrUpdatePost}
                    className="button edit-button"
                  >
                    {editId ? '수정완료' : '등록'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // 상세보기 화면
            selectedPost && (
              <>
                <div className="post-header">
                  <h2 className="post-title">{selectedPost.title}</h2>
                </div>
                <div className="post-body">
                  <div className="post-content">{selectedPost.content}</div>
                </div>
                <div className="post-buttons">
                  <div className="left-buttons">
                    <button onClick={() => setIsDetailView(false)} className="button back-button">
                      목록으로
                    </button>
                  </div>
                  <div className="right-buttons">
                    <button 
                      onClick={() => {
                        if(window.confirm('게시글을 수정하시겠습니까?')) {
                          setTitle(selectedPost.title);
                          setContent(selectedPost.content);
                          setEditId(selectedPost.id);
                          setIsWriting(true);
                        }
                      }} 
                      className="button edit-button"
                    >
                      수정하기
                    </button>
                    <button 
                      onClick={() => {
                        if(window.confirm('정말 삭제하시겠습니까?')) {
                          handleDelete(selectedPost.id);
                        }
                      }}
                      className="button delete-button"
                    >
                      삭제하기
                    </button>
                  </div>
                </div>

                {/* 댓글 섹션 - 상세보기 화면에서만 표시 */}
                <div className="comments-section">
                  <h3>댓글</h3>
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
                  <div className="comments-list">
                    {comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        {editingCommentId === comment.id ? (
                          // 수정 모드
                          <div className="comment-edit-form">
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="comment-input"
                            />
                            <div className="comment-edit-buttons">
                              <button
                                onClick={async () => {
                                  try {
                                    await updateComment(comment.id, editCommentText, comment.writer);
                                    setEditingCommentId(null);
                                    setEditCommentText("");
                                    fetchComments();
                                  } catch (error) {
                                    console.error('Error updating comment:', error);
                                    alert('댓글 수정에 실패했습니다.');
                                  }
                                }}
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
                          // 일반 모드
                          <>
                            <div className="comment-content">
                              <span className="comment-author">{comment.writer}</span>
                              <span className="comment-text">{comment.content}</span>
                              <span className="comment-date">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="comment-buttons">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="comment-edit"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id, comment.writer)}
                                className="comment-delete"
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}

      
        {/* 삭제 확인 모달 추가 */}
        {deleteConfirm.show && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <h2 className="modal-title text-center">삭제 확인</h2>
              <p className="text-center mb-6">정말 이 게시글을 삭제하시겠습니까?</p>
              <div className="modal-buttons">
                <button 
                  onClick={confirmDelete}
                  className="modal-submit bg-red-500 hover:bg-red-600"
                >
                  삭제
                </button>
                <button 
                  onClick={() => setDeleteConfirm({ show: false, postId: null })}
                  className="modal-cancel"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default App;
