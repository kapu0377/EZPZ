import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import './TokenManagementPage.css';

const TokenManagementPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  const fetchAllUserTokenInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/token/admin/all-users');
      setAllUsers(response.data);
    } catch (err) {
      setError('사용자 토큰 정보를 가져오는데 실패했습니다.');
      console.error('사용자 토큰 정보 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/token/admin/active-users');
      setActiveUsers(response.data);
    } catch (err) {
      console.error('활성 사용자 조회 실패:', err);
    }
  };

  const handleForceLogoutUser = async (username) => {
    if (!window.confirm(`정말로 ${username} 사용자를 강제 로그아웃하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/token/admin/force-logout/${username}`);
      alert(`${username} 사용자가 강제 로그아웃되었습니다.`);
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    } catch (err) {
      alert('강제 로그아웃에 실패했습니다.');
      console.error('강제 로그아웃 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceLogoutAll = async () => {
    if (!window.confirm('정말로 모든 사용자를 강제 로그아웃하시겠습니까? (관리자 제외)')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.post('/admin/token/admin/force-logout-all');
      alert(`${response.data.loggedOutCount}명의 사용자가 강제 로그아웃되었습니다.`);
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    } catch (err) {
      alert('전체 강제 로그아웃에 실패했습니다.');
      console.error('전체 강제 로그아웃 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearUserCache = async (username) => {
    if (!window.confirm(`정말로 ${username} 사용자의 캐시를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.delete(`/admin/token/admin/clear-user-cache/${username}`);
      alert(`${username} 사용자의 캐시가 삭제되었습니다.`);
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    } catch (err) {
      alert('캐시 삭제에 실패했습니다.');
      console.error('캐시 삭제 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshUserToken = async (username) => {
    if (!window.confirm(`정말로 ${username} 사용자의 토큰을 갱신하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.post(`/admin/token/admin/refresh-user-token/${username}`);
      alert(`${username} 사용자의 토큰이 갱신되었습니다.`);
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    } catch (err) {
      alert('토큰 갱신에 실패했습니다.');
      console.error('토큰 갱신 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanExpiredTokens = async () => {
    if (!window.confirm('만료된/손상된 토큰을 정리하시겠습니까?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.post('/admin/token/admin/clean-expired-tokens');
      const data = response.data;
      alert(`토큰 정리가 완료되었습니다.\n제거된 액세스토큰: ${data.removedAccessTokens}개\n제거된 리프레시토큰: ${data.removedRefreshTokens}개`);
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    } catch (err) {
      alert('토큰 정리에 실패했습니다.');
      console.error('토큰 정리 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllUserTokenInfo();
      fetchActiveUsers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="token-no-auth">
        <div className="token-no-auth-content">
          <h1 className="token-no-auth-title">접근 권한 없음</h1>
          <p className="token-no-auth-desc">이 페이지에 접근하려면 로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('ko-KR');
  };

  const getStatusBadge = (hasToken) => {
    return hasToken ? (
      <span className="status-badge status-active">활성</span>
    ) : (
      <span className="status-badge status-inactive">비활성</span>
    );
  };

  return (
    <div className="admin-token-management">
      <div className="admin-header">
        <h1 className="admin-title">관리자 토큰 관제 시스템</h1>
        <div className="admin-actions">
          <button
            onClick={() => { fetchAllUserTokenInfo(); fetchActiveUsers(); }}
            disabled={loading}
            className="admin-btn admin-btn-primary"
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
          <button
            onClick={handleCleanExpiredTokens}
            disabled={actionLoading}
            className="admin-btn admin-btn-warning"
          >
            만료토큰 정리
          </button>
          <button
            onClick={handleForceLogoutAll}
            disabled={actionLoading}
            className="admin-btn admin-btn-danger"
          >
            전체 강제 로그아웃
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>총 활성 사용자</h3>
          <div className="stat-number">{activeUsers.activeUserCount || 0}</div>
        </div>
        <div className="stat-card">
          <h3>액세스 토큰</h3>
          <div className="stat-number">{activeUsers.accessTokenCount || 0}</div>
        </div>
        <div className="stat-card">
          <h3>리프레시 토큰</h3>
          <div className="stat-number">{activeUsers.refreshTokenCount || 0}</div>
        </div>
        <div className="stat-card">
          <h3>마지막 업데이트</h3>
          <div className="stat-time">{formatDateTime(activeUsers.timestamp)}</div>
        </div>
      </div>

      {loading && (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <span>로딩 중...</span>
        </div>
      )}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {!loading && allUsers.length === 0 && (
        <div className="admin-empty">
          <h3>활성 사용자가 없습니다</h3>
          <p>현재 로그인된 사용자가 없습니다.</p>
        </div>
      )}

      {allUsers.length > 0 && (
        <div className="users-table-container">
          <h2 className="section-title">활성 사용자 목록</h2>
          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">사용자명</div>
              <div className="table-cell">액세스 토큰</div>
              <div className="table-cell">리프레시 토큰</div>
              <div className="table-cell">사용자 정보</div>
              <div className="table-cell">관리</div>
            </div>
            {allUsers.map((user, index) => (
              <div key={index} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    {user.userInfo && (
                      <div className="user-details">
                        <small>ID: {user.userInfo.id}</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="table-cell">
                  <div className="token-status">
                    {getStatusBadge(user.hasAccessToken)}
                    {user.accessToken && (
                      <div className="token-preview" title={user.accessToken}>
                        {user.accessToken}
                      </div>
                    )}
                  </div>
                </div>
                <div className="table-cell">
                  <div className="token-status">
                    {getStatusBadge(user.hasRefreshToken)}
                    {user.refreshToken && (
                      <div className="token-preview" title={user.refreshToken}>
                        {user.refreshToken}
                      </div>
                    )}
                  </div>
                </div>
                <div className="table-cell">
                  {user.userInfo ? (
                    <div className="user-info-details">
                      <div>이메일: {user.userInfo.email || 'N/A'}</div>
                      <div>역할: {user.userInfo.role || 'USER'}</div>
                    </div>
                  ) : (
                    <span className="no-info">정보 없음</span>
                  )}
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleForceLogoutUser(user.username)}
                      disabled={actionLoading}
                      className="action-btn logout-btn"
                      title="강제 로그아웃"
                    >
                      로그아웃
                    </button>
                    <button
                      onClick={() => handleRefreshUserToken(user.username)}
                      disabled={actionLoading}
                      className="action-btn refresh-btn"
                      title="토큰 갱신"
                    >
                      토큰갱신
                    </button>
                    <button
                      onClick={() => handleClearUserCache(user.username)}
                      disabled={actionLoading}
                      className="action-btn cache-btn"
                      title="캐시 삭제"
                    >
                      캐시삭제
                    </button>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="action-btn detail-btn"
                      title="상세 정보"
                    >
                      상세
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>사용자 상세 정보: {selectedUser.username}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>토큰 정보</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>액세스 토큰 상태:</label>
                    <span>{selectedUser.hasAccessToken ? '활성' : '비활성'}</span>
                  </div>
                  <div className="detail-item">
                    <label>리프레시 토큰 상태:</label>
                    <span>{selectedUser.hasRefreshToken ? '활성' : '비활성'}</span>
                  </div>
                  {selectedUser.accessToken && (
                    <div className="detail-item full-width">
                      <label>액세스 토큰:</label>
                      <div className="token-full">{selectedUser.accessToken}</div>
                    </div>
                  )}
                  {selectedUser.refreshToken && (
                    <div className="detail-item full-width">
                      <label>리프레시 토큰:</label>
                      <div className="token-full">{selectedUser.refreshToken}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedUser.userInfo && (
                <div className="detail-section">
                  <h4>사용자 정보</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>사용자 ID:</label>
                      <span>{selectedUser.userInfo.id}</span>
                    </div>
                    <div className="detail-item">
                      <label>이메일:</label>
                      <span>{selectedUser.userInfo.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>역할:</label>
                      <span>{selectedUser.userInfo.role || 'USER'}</span>
                    </div>
                    <div className="detail-item">
                      <label>생성일:</label>
                      <span>{formatDateTime(selectedUser.userInfo.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  handleForceLogoutUser(selectedUser.username);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="modal-btn danger-btn"
              >
                강제 로그아웃
              </button>
              <button
                onClick={() => {
                  handleRefreshUserToken(selectedUser.username);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="modal-btn primary-btn"
              >
                토큰 갱신
              </button>
              <button
                onClick={() => {
                  handleClearUserCache(selectedUser.username);
                  setSelectedUser(null);
                }}
                disabled={actionLoading}
                className="modal-btn warning-btn"
              >
                캐시 삭제
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="modal-btn secondary-btn"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagementPage; 