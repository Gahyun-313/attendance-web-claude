import axios from 'axios'

// 백엔드 baseURL은 .env의 VITE_API_BASE_URL 참고 (EC2 IP, 재시작 시 바뀔 수 있음)
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
