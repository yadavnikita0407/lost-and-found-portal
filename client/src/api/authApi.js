import axiosInstance from './axiosInstance'

export async function login(credentials) {
  const { data } = await axiosInstance.post('/auth/login', credentials)
  return data
}

export async function register(payload) {
  const { data } = await axiosInstance.post('/auth/register', payload)
  return data
}

export async function getMe() {
  const { data } = await axiosInstance.get('/auth/me')
  return data
}
