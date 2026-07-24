import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../types/common'
import type { LoginResponse } from '../types/auth'

// baseURL은 .env의 VITE_API_BASE_URL 참고. 개발 중엔 '/api'(상대경로)로 두고
// vite.config.ts의 server.proxy가 실제 EC2 백엔드로 넘겨줌 (CORS 우회, VITE_API_PROXY_TARGET 참고)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰 재발급 전용 요청 인스턴스 - axiosClient로 보내면 이 요청 자체가 401을 맞았을 때
// 아래 응답 인터셉터를 다시 타면서 무한 루프에 빠질 수 있어 별도로 분리.
// (api/auth.ts의 refresh()를 재사용하지 않는 이유도 같음: 그쪽이 axiosClient를 import하는데
//  axiosClient가 다시 api/auth.ts를 import하면 순환참조가 생기므로 여기서 직접 axios 인스턴스로 처리)
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// 재시도 표시용 - 같은 요청이 refresh 실패 후에도 반복 재시도되는 걸 막기 위한 1회성 플래그
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// 동시에 여러 요청이 401을 맞아도 /auth/refresh는 딱 한 번만 호출하고,
// 나머지 요청들은 그 결과(새 accessToken)를 같이 기다렸다가 재시도하도록 promise를 공유
let refreshPromise: Promise<string> | null = null

const clearAuthAndRedirectToLogin = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('저장된 refreshToken이 없음')

  const { data } = await refreshClient.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken })
  const tokens = data.data
  localStorage.setItem('accessToken', tokens.accessToken)
  localStorage.setItem('refreshToken', tokens.refreshToken)
  localStorage.setItem('user', JSON.stringify(tokens.user))
  return tokens.accessToken
}

// 요청 인터셉터: accessToken을 Authorization 헤더에 부착
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// 응답 인터셉터: Access Token 만료(401) 시 refreshToken으로 한 번 갱신 시도 후 원래 요청을 재시도.
// 갱신 자체가 실패하면(리프레시 토큰도 만료 등) 로그인 정보를 지우고 로그인 화면으로 이동
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    // /auth/login, /auth/refresh, /auth/oauth/*, /auth/join/* 자체가 401이면 자격 증명 문제라
    // 갱신 시도 없이 바로 실패 처리 (그렇지 않으면 로그인 실패가 refresh 시도로 이어져 혼란스러움)
    if (originalRequest.url?.startsWith('/auth/')) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      const newAccessToken = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      clearAuthAndRedirectToLogin()
      return Promise.reject(refreshError)
    }
  },
)

export default axiosClient
