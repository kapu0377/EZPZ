import itemApi from './itemApi';

export const searchItems = async (itemName) => {
  const result = await itemApi.searchItems(itemName);
  return result;
};

export const refreshRankings = async () => {
  try {
    const rankings = await itemApi.getSearchRankings();
    return rankings.slice(0, 6); 
  } catch (error) {
    console.error('랭킹 갱신 실패:', error);
    return [];
  }
};

export const getSearchRankings = async () => {
  return itemApi.getSearchRankings();
};

export const getDailyRankings = async () => {
  try {
    const response = await itemApi.getSearchRankings();
    return response;
  } catch (error) {
    console.error('일간 랭킹 조회 실패:', error);
    return [];
  }
};

export const getWeeklyRankings = async () => {
  try {
    const response = await itemApi.getWeeklyRankings();
    return response;
  } catch (error) {
    console.error('주간 랭킹 조회 실패:', error);
    return [];
  }
};

export const getMonthlyRankings = async () => {
  try {
    const response = await itemApi.getMonthlyRankings();
    return response;
  } catch (error) {
    console.error('월간 랭킹 조회 실패:', error);
    return [];
  }
};

export const getUserSearchHistory = async (username) => {
  return itemApi.getUserSearchHistory(username);
};

export const saveSearchHistory = async (username, keyword, searchDate) => {
  return itemApi.saveSearchHistory(username, keyword, searchDate);
};

export const getUserSearchHistoryByDays = async (username, days) => {
  return itemApi.getUserSearchHistoryByDays(username, days);
};

export const getUserSearchHistoryPaginated = async (username, days, page = 1, pageSize = 10) => {
  return itemApi.getUserSearchHistoryPaginated(username, days, page, pageSize);
};

export const getDetectionRankings = async () => {
  return itemApi.getDetectionRankings();
};
