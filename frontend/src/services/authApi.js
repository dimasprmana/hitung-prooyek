import { request } from './api'

export function registerUser(data) {
  return request('/auth/register', {
    method: 'POST',
    body: data,
  })
}

export function loginUser(data) {
  return request('/auth/login', {
    method: 'POST',
    body: data,
  })
}

export function logoutUser() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

export function getCurrentUser() {
  return request('/auth/me')
}

export function forgotPassword(data) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: data,
  })
}

export function getProfile() {
  return request('/profile')
}

export function updateProfile(data) {
  return request('/profile', {
    method: 'PUT',
    body: data,
  })
}

export function updatePassword(data) {
  return request('/profile/password', {
    method: 'PUT',
    body: data,
  })
}
