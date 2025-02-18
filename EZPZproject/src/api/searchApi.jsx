import itemApi from './itemApi';

export const searchItems = async (itemName) => {
  return itemApi.searchItems(itemName);
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