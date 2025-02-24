import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentPost.css';
import arrow from '../../assets/img/arrow.png';

const RecentPosts = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('http://localhost:8088/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      // 최신 5개 게시물만 필터링
      const latestPosts = data.slice(0, 5);
      setRecentPosts(latestPosts);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId) => {
    navigate('/board', { state: { selectedPostId: postId } });
  };

  return (
    <div className="recent-posts">
      <div className="title-with-arrow">
        <h2>게시판</h2>
        <button onClick={() => navigate('/board')} className="more-button">
          <img src={arrow} alt="더보기" className="arrow-icon" />
        </button>
      </div>
      {loading ? (
        <div className="loading">로딩중...</div>
      ) : (
        <div className="posts-container">
          {recentPosts.map((post) => (
            <div 
              key={post.id} 
              className="post-row"
              onClick={() => handlePostClick(post.id)}
            >
              <span className="post-title" style={{ fontSize: '11px' }}>{post.title}</span>
              <div className="post-info">
                <span className="post-date" style={{ fontSize: '11px' }}>
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPosts;