// 구글/카카오 SDK처럼 npm 패키지가 아니라 <script> 태그로 불러와야 하는 외부 스크립트를 동적으로 추가하고,
// 로드가 끝날 때까지 기다리는 헬퍼. 같은 src를 두 번 요청해도 중복으로 추가하지 않음
const loadedScripts = new Set<string>()

export const loadScript = (src: string): Promise<void> => {
  if (loadedScripts.has(src)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => {
      loadedScripts.add(src)
      resolve()
    }
    script.onerror = () => reject(new Error(`스크립트를 불러오지 못했습니다: ${src}`))
    document.head.appendChild(script)
  })
}
