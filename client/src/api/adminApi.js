import axiosInstance from './axiosInstance'

export async function getStats() {
  const { data } = await axiosInstance.get('/admin/stats')
  return data
}

export async function getAdminReports(params = {}) {
  const { data } = await axiosInstance.get('/admin/reports', { params })
  return data
}

export async function updateReport(id, payload) {
  const { data } = await axiosInstance.patch(`/admin/reports/${id}`, payload)
  return data
}

export async function getAdminClaims(params = {}) {
  const { data } = await axiosInstance.get('/admin/claims', { params })
  return data
}

export async function updateClaim(id, payload) {
  const { data } = await axiosInstance.patch(`/admin/claims/${id}`, payload)
  return data
}

export async function getUsers(params = {}) {
  const { data } = await axiosInstance.get('/admin/users', { params })
  return data
}

export async function updateUser(id, payload) {
  const { data } = await axiosInstance.patch(`/admin/users/${id}`, payload)
  return data
}

export async function getLogs(params = {}) {
  const { data } = await axiosInstance.get('/admin/logs', { params })
  return data
}
