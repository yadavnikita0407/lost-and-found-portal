import axiosInstance from './axiosInstance'

export async function fetchItems(params = {}) {
  const { data } = await axiosInstance.get('/items', { params })
  return data
}

export async function fetchItemById(id) {
  const { data } = await axiosInstance.get(`/items/${id}`)
  return data
}

export async function createItem(formData) {
  const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  const { data } = await axiosInstance.post('/items', formData, { headers })
  return data
}

export async function updateItem(id, formData) {
  const headers = formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  const { data } = await axiosInstance.put(`/items/${id}`, formData, { headers })
  return data
}

export async function deleteItem(id) {
  const { data } = await axiosInstance.delete(`/items/${id}`)
  return data
}
