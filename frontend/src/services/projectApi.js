import { request } from './api'

export function getProjects() {
  return request('/projects')
}

export function getProjectById(id) {
  return request(`/projects/${id}`)
}

export function createProject(data) {
  return request('/projects', {
    method: 'POST',
    body: data,
  })
}

export function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PUT',
    body: data,
  })
}

export function deleteProject(id) {
  return request(`/projects/${id}`, {
    method: 'DELETE',
  })
}

export function addProjectWork(projectId, data) {
  return request(`/projects/${projectId}/works`, {
    method: 'POST',
    body: data,
  })
}

export function deleteProjectWork(projectId, workId) {
  return request(`/projects/${projectId}/works/${workId}`, {
    method: 'DELETE',
  })
}
