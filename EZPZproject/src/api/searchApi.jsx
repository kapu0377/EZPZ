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
  return itemApi.getDailyRankings();
};

export const getWeeklyRankings = async () => {
  return itemApi.getWeeklyRankings();
};

export const getMonthlyRankings = async () => {
  return itemApi.getMonthlyRankings();
};

export const getUserSearchHistory = async (username) => {
  return itemApi.getUserSearchHistory(username);
};

export const getDetectionRankings = async () => {
  return itemApi.getDetectionRankings();
};