import React, { useState, useEffect } from 'react';
import { validateTokenIntegrity, isRefreshTokenExpired } from '../../utils/authUtils';
import { getSecureItem } from '../../utils/cryptoUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TokenSecurityMonitor = ({ isDevelopment = false }) => {
  const [securityInfo, setSecurityInfo] = useState({});
  const [isVisible, setIsVisible] = useState(isDevelopment);
  const [showMonitor, setShowMonitor] = useState(isDevelopment);
  const { tokenStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.altKey && event.key === 'D') {
        event.preventDefault();
        setShowMonitor(prev => !prev);
        if (!showMonitor) {
          setIsVisible(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMonitor]);

  useEffect(() => {
    if ((!isDevelopment && !showMonitor) || !isVisible) return;

    const updateSecurityInfo = () => {
      const refreshToken = getSecureItem('refreshToken');
      const integrity = validateTokenIntegrity();
      const isExpired = isRefreshTokenExpired();
      
      setSecurityInfo({
        hasEncryptedToken: !!refreshToken,
        tokenIntegrity: integrity,
        isExpired,
        lastChecked: new Date().toLocaleTimeString()
      });
    };

    updateSecurityInfo();
    const interval = isVisible ? setInterval(updateSecurityInfo, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDevelopment, showMonitor, isVisible]);



  if (!isDevelopment && !showMonitor) return null;

  const getStatusColor = (status) => {
    if (status === true || (typeof status === 'object' && status.isValid)) {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  const getStatusText = (status) => {
    if (status === true) return '✓';
    if (status === false) return '✗';
    if (typeof status === 'object' && status.isValid) return '✓';
    if (typeof status === 'object' && !status.isValid) return `✗ (${status.reason})`;
    return '?';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
          title="토큰 보안 모니터 열기 (또는 Ctrl+Alt+D)"
        >
          🔐
        </button>
      ) : (
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">토큰 보안 상태</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>인증 상태:</span>
              <span className={getStatusColor(isAuthenticated)}>
                {getStatusText(isAuthenticated)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>암호화된 토큰:</span>
              <span className={getStatusColor(securityInfo.hasEncryptedToken)}>
                {getStatusText(securityInfo.hasEncryptedToken)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>토큰 무결성:</span>
              <span className={getStatusColor(securityInfo.tokenIntegrity)}>
                {getStatusText(securityInfo.tokenIntegrity)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>만료 상태:</span>
              <span className={getStatusColor(!securityInfo.isExpired)}>
                {securityInfo.isExpired ? '✗ 만료됨' : '✓ 유효함'}
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="text-gray-400 text-xs">
                마지막 확인: {securityInfo.lastChecked}
              </div>
            </div>
            
            {tokenStatus && !tokenStatus.isValid && (
              <div className="mt-2 p-2 bg-red-900 rounded text-xs">
                경고: {tokenStatus.reason}
              </div>
            )}
            
            <div className="border-t border-gray-700 pt-2 mt-2">
              <button
                onClick={() => navigate('/admin/token-management')}
                className="w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
              >
                관리 페이지 열기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSecurityMonitor; 