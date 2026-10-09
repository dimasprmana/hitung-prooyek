import { request } from './api'

export function getMaterials() {
  return request('/materials')
}

export function getMaterialById(id) {
  return request(`/materials/${id}`)
}
