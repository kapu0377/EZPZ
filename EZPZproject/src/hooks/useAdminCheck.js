import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('useAdminCheck: 관리자 상태 확인 시작, isAuthenticated:', isAuthenticated, 'user:', user);
      
      if (!isAuthenticated) {
        console.log('useAdminCheck: 인증되지 않음, 관리자 아님');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useAdminCheck: /user/info 호출 중...');
        const response = await axiosInstance.get('/user/info');
        console.log('useAdminCheck: API 응답:', response.data);
        const adminStatus = response.data.isAdmin || false;
        console.log('useAdminCheck: 관리자 상태:', adminStatus);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('useAdminCheck: 관리자 상태 확인 실패:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
        console.log('useAdminCheck: 로딩 완료');
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user]);

  return { isAdmin, loading };
}; 