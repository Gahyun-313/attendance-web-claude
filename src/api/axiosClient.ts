import axios from 'axios'

// baseURL은 .env의 VITE_API_BASE_URL 참고. 개발 중엔 '/api'(상대경로)로 두고
// vite.config.ts의 server.proxy가 실제 EC2 백엔드로 넘겨줌 (CORS 우회, VITE_API_PROXY_TARGET 참고)
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: accessToken을 Authorization 헤더에 부착
axiosClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// 응답 인터셉터: Access Token 만료(401) 대응 지점
// TODO(로그인 화면 작업 시): /api/auth/refresh 호출 → 재시도, 실패 시 로그인 페이지로 이동
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: refreshToken으로 갱신 시도
    }
    return Promise.reject(error)
  },
)

export default axiosClient
