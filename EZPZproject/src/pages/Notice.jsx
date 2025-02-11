import React, { useState } from "react";
import {createPost, updatePost, deletePost} from "../api/postApi";
import '../notice/Notice.css';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10; // 페이지당 게시글 수

  // 페이지네이션 처리
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase())
  ).slice(indexOfFirstPost, indexOfLastPost);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase())
  ).length / postsPerPage);

  const addOrUpdatePost = async () => {
    if (title && content) {
      try {
        if (editId) {
          await updatePost(editId, title, content);
          setPosts(posts.map(post => 
            post.id === editId ? { ...post, title, content } : post
          ));
          setEditId(null);
        } else {
          if (posts.length >= 90) { // 최대 90개로 제한
            alert("최대 게시글 수에 도달했습니다.");
            return;
          }
          const data = await createPost(title, content);
          setPosts([...posts, data]);
        }
        setTitle("");
        setContent("");
        setIsWriting(false);
      } catch (error) {
        console.error("Error:", error);
        alert("게시글 저장에 실패했습니다.");
      }
    } else {
      alert("제목과 내용을 모두 입력해주세요.");
    }
  };

  const removePost = async (id) => {
    await deletePost(id);
    setPosts(posts.filter(post => post.id !== id));
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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClick = () => {
    const confirmed = window.confirm("게시글을 작성하시겠습니까?");
    if (confirmed) {
      setIsWriting(true);
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
  };

  return (
    <div className="container">
      <div className="left-section">
        <h2 className="title">게시판</h2>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={handleAddClick}
            className="add-button"
            title="게시글 작성"
          >
            +
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
                      <button 
                        onClick={() => handleViewPost(post)}
                        className="text-left hover:text-blue-600"
                      >
                        {post.title}
                      </button>
                    </td>
                    <td className="px-4 py-2">작성자</td>
                    <td className="px-4 py-2">{new Date().toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => editPost(post.id)} 
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          수정하기
                        </button>
                        <button 
                          onClick={() => removePost(post.id)} 
                          className="text-red-500 hover:text-red-600"
                        >
                          삭제하기
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            ◀
          </button>
          {[...Array(9)].map((_, i) => (
            <button 
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded hover:bg-gray-100 
                ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            ▶
          </button>
        </div>
      </div>

      {selectedPost && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="modal-title"> 제목 : {selectedPost.title}</h2>
            </div>
            <div className="border-t border-b py-4 mb-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                내용 : {selectedPost.content}
              </p>
            </div>
            <div className="modal-buttons">
              <button 
                onClick={() => {
                  editPost(selectedPost.id);
                  setSelectedPost(null);
                }}
                className="modal-submit"
              >
                수정
              </button>
              <button 
                onClick={() => {
                  if(window.confirm('정말 삭제하시겠습니까?')) {
                    removePost(selectedPost.id);
                    setSelectedPost(null);
                  }
                }}
                className="modal-cancel"
              >
                삭제
              </button>
              <button 
                onClick={() => setSelectedPost(null)}
                className="modal-cancel"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {isWriting && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editId ? '글 수정하기' : '새 글 작성'}</h2>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="내용을 입력하세요"
              className="modal-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="modal-buttons">
              <button 
                onClick={() => {
                  addOrUpdatePost();
                  setIsWriting(false);
                }}
                className="modal-submit"
              >
                {editId ? '수정' : '등록'}
              </button>
              <button 
                onClick={() => setIsWriting(false)}
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
