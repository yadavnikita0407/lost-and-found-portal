import axiosInstance from './axiosInstance'

export async function submitClaim(payload) {
  const { data } = await axiosInstance.post('/claims', payload)
  return data
}

export async function getMyClaims() {
  const { data } = await axiosInstance.get('/claims/my')
  return data
}

export async function getClaimById(id) {
  const { data } = await axiosInstance.get(`/claims/${id}`)
  return data
}
