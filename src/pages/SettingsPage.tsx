// TODO: 백엔드 설정 API(조직 정보/출석 정책) 자체가 아직 없어서 계속 placeholder 상태
// MSW로 GET/PUT organization, GET/PUT attendance-policy만 mock 처리돼있음 (src/mocks/handlers.ts)
const SettingsPage = () => {
  // ===== UI: 아직 placeholder - 실제 화면은 백엔드 API 확정 후 다른 화면들과 같은 패턴(필터/카드/폼)으로 구현 예정 =====
  return (
    <div>
      <h1>설정</h1>
      <p>TODO: 조직 정보 / 출석 정책 / 관리자 계정 설정 화면 구현 예정</p>
    </div>
  )
}

export default SettingsPage
