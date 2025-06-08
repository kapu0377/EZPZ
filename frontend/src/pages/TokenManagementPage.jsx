import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import './TokenManagementPage.css';

const TokenManagementPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [redisDebugInfo, setRedisDebugInfo] = useState(null);
  const [showRedisDebug, setShowRedisDebug] = useState(false);
  const [isTokenCheckActive, setIsTokenCheckActive] = useState(true);
  const { isAuthenticated, user: currentUser, logout } = useAuth();

  // 현재 사용자가 TENANT 역할인지 확인하는 함수
  const isTenant = () => {
    return currentUser?.role === 'TENANT';
  };

  // 현재 사용자가 ADMIN 이상의 권한을 가지는지 확인하는 함수
  const hasAdminAccess = () => {
    return currentUser?.role === 'ADMIN' || currentUser?.role === 'TENANT';
  };

  const fetchAllUserTokenInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/admin/token/admin/all-users');
      console.log('백엔드 응답 데이터:', response.data);
      console.log('사용자 수:', response.data.length);
      console.log('현재 사용자:', currentUser?.username);
      console.log('응답에 포함된 사용자명들:', response.data.map(user => user.username));
      setAllUsers(response.data);
    } catch (err) {
      let errorMessage = '사용자 토큰 정보를 가져오는데 실패했습니다.';
      if (err.response?.status === 403) {
        errorMessage = '접근 권한이 없습니다. 관리자 권한이 필요합니다.';
      } else if (err.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
      } else if (err.response?.data?.error) {
        errorMessage = `오류: ${err.response.data.error}`;
      }
      setError(errorMessage);
      console.error('사용자 토큰 정보 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogoutUser = async (username) => {
    if (!hasAdminAccess()) {
      alert("관리자 권한이 필요합니다.");
      return;
    }

    if (username === currentUser?.username) {
      alert("자기 자신은 강제 로그아웃할 수 없습니다.");
      return;
    }

    // TENANT가 아닌 경우 다른 TENANT나 ADMIN을 로그아웃할 수 없도록 제한
    const targetUser = allUsers.find(user => user.username === username);
    if (!isTenant() && targetUser?.userInfo?.role && ['TENANT', 'ADMIN'].includes(targetUser.userInfo.role)) {
      alert("상위 권한 사용자는 강제 로그아웃할 수 없습니다.");
      return;
    }

    if (!window.confirm(`정말로 ${username} 사용자를 강제 로그아웃하시겠습니까?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/token/admin/force-logout/${username}`);
      alert(`${username} 사용자가 강제 로그아웃되었습니다.`);
      fetchAllUserTokenInfo();
    } catch (err) {
      let errorMessage = '강제 로그아웃에 실패했습니다.';
      if (err.response?.status === 403) {
        errorMessage = '권한이 없습니다. 해당 사용자를 로그아웃할 수 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '사용자를 찾을 수 없습니다.';
      } else if (err.response?.data?.error) {
        errorMessage = `오류: ${err.response.data.error}`;
      }
      alert(errorMessage);
      console.error('강제 로그아웃 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceLogoutAll = async () => {
    if (!isTenant()) {
      alert("TENANT 권한이 필요합니다.");
      return;
    }

    if (!window.confirm('정말로 모든 사용자를 강제 로그아웃하시겠습니까? (테넌트 및 본인 제외)')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.post('/admin/token/admin/force-logout-all');
      alert(`${response.data.loggedOutCount}명의 사용자가 강제 로그아웃되었습니다.`);
      fetchAllUserTokenInfo();
    } catch (err) {
      let errorMessage = '전체 강제 로그아웃에 실패했습니다.';
      if (err.response?.status === 403) {
        errorMessage = 'TENANT 권한이 필요합니다.';
      } else if (err.response?.data?.error) {
        errorMessage = `오류: ${err.response.data.error}`;
      }
      alert(errorMessage);
      console.error('전체 강제 로그아웃 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshUserToken = async (username) => {
    if (!hasAdminAccess()) {
      alert("관리자 권한이 필요합니다.");
      return;
    }

    if (username === currentUser?.username) {
      alert("자기 자신의 토큰은 이 버튼으로 강제 갱신할 수 없습니다. 필요한 경우 재로그인하세요.");
      return;
    }

    // TENANT가 아닌 경우 다른 TENANT나 ADMIN의 토큰을 갱신할 수 없도록 제한
    const targetUser = allUsers.find(user => user.username === username);
    if (!isTenant() && targetUser?.userInfo?.role && ['TENANT', 'ADMIN'].includes(targetUser.userInfo.role)) {
      alert("상위 권한 사용자의 토큰은 갱신할 수 없습니다.");
      return;
    }

    if (!window.confirm(`정말로 ${username} 사용자의 토큰을 강제 갱신하시겠습니까? (해당 사용자는 재로그인 필요)`)) {
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.post(`/admin/token/admin/refresh-token/${username}`);
      alert(`${username} 사용자의 토큰이 강제 갱신되었습니다. 해당 사용자는 재로그인이 필요할 수 있습니다.`);
      fetchAllUserTokenInfo();
    } catch (err) {
      let errorMessage = '토큰 갱신에 실패했습니다.';
      if (err.response?.status === 403) {
        errorMessage = '권한이 없습니다. 해당 사용자의 토큰을 갱신할 수 없습니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '사용자를 찾을 수 없습니다.';
      } else if (err.response?.data?.error) {
        errorMessage = `오류: ${err.response.data.error}`;
      }
      alert(errorMessage);
      console.error('토큰 갱신 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };
  
  const fetchRedisDebugInfo = async () => {
    if (!isTenant()) {
      alert("TENANT 권한이 필요합니다.");
      return;
    }

    if (showRedisDebug) {
      setShowRedisDebug(false);
      setRedisDebugInfo(null);
      return;
    }

    try {
      setActionLoading(true);
      const response = await axiosInstance.get('/admin/token/admin/redis-debug');
      setRedisDebugInfo(response.data);
      setShowRedisDebug(true);
    } catch (err) {
      let errorMessage = 'Redis 디버그 정보 조회에 실패했습니다.';
      if (err.response?.status === 403) {
        errorMessage = 'TENANT 권한이 필요합니다.';
      } else if (err.response?.data?.error) {
        errorMessage = `오류: ${err.response.data.error}`;
      }
      alert(errorMessage);
      console.error('Redis 디버그 정보 조회 실패:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 사용자 작업 버튼 활성화 여부를 결정하는 함수
  const canPerformAction = (targetUser) => {
    if (!hasAdminAccess()) return false;
    if (targetUser.username === currentUser?.username) return false;
    if (!isTenant() && targetUser.userInfo?.role && ['TENANT', 'ADMIN'].includes(targetUser.userInfo.role)) return false;
    return true;
  };

  const checkTokenStatus = useCallback(async () => {
    if (!isAuthenticated || !isTokenCheckActive) return;
    
    try {
      const response = await axiosInstance.get('/admin/token/admin/status');
      
      if (!response.data.hasAccessToken && !response.data.hasRefreshToken) {
        console.log('강제 로그아웃 감지: 토큰이 모두 삭제됨');
        setIsTokenCheckActive(false);
        alert('관리자에 의해 강제 로그아웃되었습니다.');
        logout();
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('토큰이 무효화되었습니다. 자동 로그아웃 처리합니다.');
        setIsTokenCheckActive(false);
        alert('인증이 만료되어 로그아웃되었습니다.');
        logout();
      }
    }
  }, [isAuthenticated, isTokenCheckActive, logout]);

  // 주기적 토큰 상태 확인
  useEffect(() => {
    if (!isAuthenticated || !isTokenCheckActive) return;
    
    const interval = setInterval(checkTokenStatus, 5000); // 5초마다 확인
    return () => clearInterval(interval);
  }, [checkTokenStatus, isAuthenticated, isTokenCheckActive]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllUserTokenInfo();
    }
  }, [isAuthenticated]);

  const getStatusBadge = (hasToken) => {
    return hasToken 
      ? <span className="status-badge active">유효</span> 
      : <span className="status-badge inactive">없음/만료</span>;
  };

  const getRoleBadgeClass = (role) => {
    const roleClass = (role || 'USER').toLowerCase();
    return `role-badge role-${roleClass}`;
  };

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

  if (!hasAdminAccess()) {
    return (
      <div className="token-no-auth">
        <div className="token-no-auth-content">
          <h1 className="token-no-auth-title">관리자 권한 필요</h1>
          <p className="token-no-auth-desc">이 페이지는 관리자 권한이 필요합니다.</p>
          <p className="token-no-auth-desc">현재 권한: {currentUser?.role || 'USER'}</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return <div className="token-loading">데이터를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="token-error">
        <h2>오류 발생</h2>
        <p>{error}</p>
        <button onClick={fetchAllUserTokenInfo} className="action-btn primary-btn">다시 시도</button>
      </div>
    );
  }

  return (
    <div className={`token-management-page ${showRedisDebug ? 'debug-visible' : ''}`}>
      <header className="page-header">
        <h1>토큰 및 사용자 관리 대시보드</h1>
        <div className="user-info-header">
          <span className="current-user">현재 사용자: {currentUser?.username}</span>
          <span className={getRoleBadgeClass(currentUser?.role)}>{currentUser?.role || 'USER'}</span>
        </div>
        <div className="header-actions">
          <button onClick={fetchAllUserTokenInfo} disabled={actionLoading} className="action-btn secondary-btn">
            새로고침
          </button>
          {isTenant() && (
            <button onClick={handleForceLogoutAll} disabled={actionLoading} className="action-btn danger-btn">
              전체 강제 로그아웃 (본인/테넌트 제외)
            </button>
          )}
        </div>
      </header>

      <div className="admin-actions-bar">
        {isTenant() && (
          <button onClick={fetchRedisDebugInfo} disabled={actionLoading} className="action-btn info-btn">
            {showRedisDebug ? 'Redis 디버그 숨기기' : 'Redis 디버그 보기'}
          </button>
        )}
      </div>

      {showRedisDebug && redisDebugInfo && (
        <section className="redis-debug-section">
          <h2>Redis 디버그 정보 (TENANT 전용)</h2>
          <pre>{JSON.stringify(redisDebugInfo, null, 2)}</pre>
        </section>
      )}

      {!loading && !error && (
        <div className="users-section">
          <h2 className="section-title">사용자 토큰 관리 ({allUsers.length}명)</h2>
          <div className="table-container">
            <div className="table-header">
              <div className="table-cell username">사용자명</div>
              <div className="table-cell token-status">액세스 토큰</div>
              <div className="table-cell token-status">리프레시 토큰</div>
              <div className="table-cell user-info">사용자 정보</div>
              <div className="table-cell actions">작업</div>
            </div>
            {console.log('렌더링할 사용자 목록:', allUsers)}
            {allUsers.map((user) => (
              <div className="table-row" key={user.username}>
                <div className="table-cell username">
                  {user.username}
                  {user.username === currentUser?.username && <span className="self-indicator">(나)</span>}
                </div>
                <div className="table-cell token-status">
                  {getStatusBadge(user.hasAccessToken)}
                </div>
                <div className="table-cell token-status">
                  {getStatusBadge(user.hasRefreshToken)}
                </div>
                <div className="table-cell user-info">
                  {user.userInfo ? (
                    <div className="user-info-details">
                      <div>ID: {user.userInfo.id}</div>
                      <div>이메일: {user.userInfo.email || 'N/A'}</div>
                      <div className={getRoleBadgeClass(user.userInfo.role)}>{user.userInfo.role || 'USER'}</div>
                    </div>
                  ) : (
                    <span className="no-info">사용자 정보 없음</span>
                  )}
                </div>
                <div className="table-cell actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => handleForceLogoutUser(user.username)}
                      disabled={actionLoading || !canPerformAction(user)}
                      className="action-btn danger-btn" 
                      title={
                        user.username === currentUser?.username 
                          ? "자기 자신은 강제 로그아웃 불가" 
                          : !hasAdminAccess()
                          ? "관리자 권한 필요"
                          : !isTenant() && user.userInfo?.role && ['TENANT', 'ADMIN'].includes(user.userInfo.role)
                          ? "상위 권한 사용자는 로그아웃 불가"
                          : "강제 로그아웃"
                      }
                    >
                      강제 로그아웃
                    </button>
                    <button
                      onClick={() => handleRefreshUserToken(user.username)}
                      disabled={actionLoading || !canPerformAction(user)}
                      className="action-btn refresh-btn"
                      title={
                        user.username === currentUser?.username 
                          ? "자기 자신 토큰 갱신 불가" 
                          : !hasAdminAccess()
                          ? "관리자 권한 필요"
                          : !isTenant() && user.userInfo?.role && ['TENANT', 'ADMIN'].includes(user.userInfo.role)
                          ? "상위 권한 사용자 토큰 갱신 불가"
                          : "토큰 강제 갱신"
                      }
                    >
                      토큰 강제갱신
                    </button>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="action-btn detail-btn"
                      title="상세 정보 보기"
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
              <h3>{selectedUser.username} - 사용자 상세 정보</h3>
              <button onClick={() => setSelectedUser(null)} className="modal-close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>사용자명:</strong> {selectedUser.username}</p>
              <p><strong>액세스 토큰 유무:</strong> {selectedUser.hasAccessToken ? '있음' : '없음/만료'}</p>
              {selectedUser.accessToken && (
                <div className="modal-token-details">
                  <strong>액세스 토큰:</strong>
                  <textarea readOnly value={selectedUser.accessToken} rows={3} />
                </div>
              )}
              <p><strong>리프레시 토큰 유무:</strong> {selectedUser.hasRefreshToken ? '있음' : '없음/만료'}</p>
              {selectedUser.refreshToken && (
                <div className="modal-token-details">
                  <strong>리프레시 토큰:</strong>
                  <textarea readOnly value={selectedUser.refreshToken} rows={3} />
                </div>
              )}
              {selectedUser.userInfo && (
                <>
                  <p><strong>사용자 ID:</strong> {selectedUser.userInfo.id || 'N/A'}</p>
                  <p><strong>이메일:</strong> {selectedUser.userInfo.email || 'N/A'}</p>
                  <p><strong>역할:</strong> 
                    <span className={getRoleBadgeClass(selectedUser.userInfo.role)}>
                      {selectedUser.userInfo.role || 'USER'}
                    </span>
                  </p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  handleForceLogoutUser(selectedUser.username);
                  setSelectedUser(null);
                }}
                disabled={actionLoading || !canPerformAction(selectedUser)}
                className="modal-btn danger-btn"
                title={
                  selectedUser.username === currentUser?.username 
                    ? "자기 자신은 강제 로그아웃 불가" 
                    : !hasAdminAccess()
                    ? "관리자 권한 필요"
                    : !isTenant() && selectedUser.userInfo?.role && ['TENANT', 'ADMIN'].includes(selectedUser.userInfo.role)
                    ? "상위 권한 사용자는 로그아웃 불가"
                    : "강제 로그아웃"
                }
              >
                강제 로그아웃
              </button>
              <button
                onClick={() => {
                  handleRefreshUserToken(selectedUser.username);
                  setSelectedUser(null);
                }}
                disabled={actionLoading || !canPerformAction(selectedUser)}
                className="modal-btn primary-btn"
                title={
                  selectedUser.username === currentUser?.username 
                    ? "자기 자신 토큰 갱신 불가" 
                    : !hasAdminAccess()
                    ? "관리자 권한 필요"
                    : !isTenant() && selectedUser.userInfo?.role && ['TENANT', 'ADMIN'].includes(selectedUser.userInfo.role)
                    ? "상위 권한 사용자 토큰 갱신 불가"
                    : "토큰 강제 갱신"
                }
              >
                토큰 강제갱신
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