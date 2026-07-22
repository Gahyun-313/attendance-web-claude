import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: {
        // 개발 서버 전용 우회로: 배포된 백엔드가 아직 localhost:5173을 CORS 허용 origin으로
        // 안 열어줘서, Vite가 대신 요청을 넘겨준다 (브라우저 입장에선 같은 origin이라 CORS 안 걸림)
        // 실제 배포/운영 단계에선 백엔드 CORS 설정 또는 리버스 프록시로 대체해야 함
        '/api': {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
        },
      },
    },
  }
})
