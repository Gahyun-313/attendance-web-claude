// 구글 Identity Services / 카카오 JS SDK는 npm 패키지가 아니라 <script> 태그로 전역(window)에 로드되므로,
// 여기서 실제로 쓰는 부분만 최소한으로 타입 선언해둠 (공식 @types 패키지는 안 씀 - 두 SDK 다 자체 타입 배포 안 함)
export interface GoogleCredentialResponse {
  /** 구글 ID Token (JWT) - 백엔드 소셜 로그인 API에 그대로 전달하는 값 */
  credential: string
}

interface GoogleAccountsId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void
  prompt: () => void
}

interface KakaoAuthObj {
  access_token: string
}

interface KakaoAuth {
  login: (options: { success: (authObj: KakaoAuthObj) => void; fail: (error: unknown) => void }) => void
}

interface KakaoSdk {
  init: (jsKey: string) => void
  isInitialized: () => boolean
  Auth: KakaoAuth
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
    Kakao?: KakaoSdk
  }
}
