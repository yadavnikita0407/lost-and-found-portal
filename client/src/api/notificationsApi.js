import axiosInstance from './axiosInstance'

export async function getNotifications() {
  const { data } = await axiosInstance.get('/notifications')
  return data
}

export async function markRead(id) {
  const { data } = await axiosInstance.patch(`/notifications/${id}/read`)
  return data
}

export async function markAllRead() {
  const { data } = await axiosInstance.patch('/notifications/read-all')
  return data
}
