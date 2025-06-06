import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts } from "../../api/postService";
import { checkAuthStatus } from "../../utils/authUtils";

const PostList = ({ onAddClick }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("title");
  const [activeSearch, setActiveSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });
  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error("게시글을 불러오는데 실패했습니다:", error);
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchTerm);
    setCurrentPage(1);
  };

  const filteredPosts = posts.filter((post) => {
    const searchLower = activeSearch.toLowerCase();
    switch (searchType) {
      case "title":
        return post.title.toLowerCase().includes(searchLower);
      case "writer":
        return (post.writer || "").toLowerCase().includes(searchLower);
      case "content":
        return post.content.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    localStorage.setItem("currentPage", pageNumber.toString());
  };

  const handleViewPost = (post) => {
    navigate(`/board/${post.id}`);
  };

  return (
    <div className="left-section">
      <div className="description-section2">
        <h1>자유 게시판</h1>
        <p className="checklist-alert">
          건의사항이나 개선할 점 등 자유롭게 글을 남겨주세요.
        </p>
      </div>

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
          placeholder={
            searchType === "title"
              ? "제목 검색..."
              : searchType === "writer"
              ? "작성자 검색..."
              : "내용 검색..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          검색
        </button>
        {checkAuthStatus().isAuthenticated && (
          <button onClick={onAddClick} className="add-button" title="글쓰기">
            글쓰기
          </button>
        )}
   
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
                  <td className="px-4 py-2">
                    {filteredPosts.length - (currentPage - 1) * postsPerPage - index}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      onClick={() => handleViewPost(post)}
                      className="title-link title-ellipsis"
                      title={post.title}
                    >
                      {post.title.length > 15
                        ? post.title.slice(0, 15) + "..."
                        : post.title}
                    </span>
                  </td>
                  <td className="px-4 py-2">{post.writer || "작성자"}</td>
                  <td className="px-4 py-2">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "날짜 없음"}
                  </td>
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
        {pageNumbers.map((number) => (
          <span
            key={number}
            className={`page-number ${currentPage === number ? "active" : ""}`}
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
  );
};

export default PostList;
