import axiosInstance from './axiosInstance'

export async function getMatchesForItem(itemId) {
  const { data } = await axiosInstance.get(`/matches/item/${itemId}`)
  return data
}
