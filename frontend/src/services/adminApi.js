import { request } from './api'

export function getAdminDashboard() {
  return request('/admin/dashboard')
}

export function getAdminUsers() {
  return request('/admin/users')
}

export function getAdminUserById(id) {
  return request(`/admin/users/${id}`)
}

export function updateAdminUserStatus(id, status) {
  return request(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function getAdminMaterials() {
  return request('/admin/materials')
}

export async function getAdminMaterialById(id) {
  const response = await getAdminMaterials()

  const items = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : []

  const material = items.find(
    (item) => String(item.id) === String(id),
  )

  if (!material) {
    throw new Error('Material tidak ditemukan.')
  }

  return material
}

export function createAdminMaterial(data) {
  return request('/admin/materials', {
    method: 'POST',
    body: data,
  })
}

export function updateAdminMaterial(id, data) {
  return request(`/admin/materials/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export function deleteAdminMaterial(id) {
  return request(`/admin/materials/${id}`, {
    method: 'DELETE',
  })
}

export function getAdminMaterialPrices(id) {
  return request(`/admin/materials/${id}/prices`)
}

export function createAdminMaterialPrice(id, data) {
  return request(`/admin/materials/${id}/prices`, {
    method: 'POST',
    body: data,
  })
}

export function getAdminProjects() {
  return request('/admin/projects')
}

export function getAdminProjectById(id) {
  return request(`/admin/projects/${id}`)
}

export function getAdminCalculations() {
  return request('/admin/calculations')
}
