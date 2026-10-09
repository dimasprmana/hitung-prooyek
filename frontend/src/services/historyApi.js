import { request } from './api'

export function getCalculationHistory() {
  return request('/history')
}

export function saveCalculationHistory(data) {
  return request('/history', {
    method: 'POST',
    body: data,
  })
}

export function getCalculationHistoryById(id) {
  return request(`/history/${id}`)
}

export function deleteCalculationHistory(id) {
  return request(`/history/${id}`, {
    method: 'DELETE',
  })
}