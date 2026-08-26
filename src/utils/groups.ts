// 2026-08-26(STEP32)부터 미사용 - deprecated.
// 예전엔 그룹 select에 쓰던 하드코딩 목록(GROUPS)이었는데, BE 그룹 마스터 API(GET/POST/PUT/DELETE /api/groups)가
// 생기면서 SessionsPage.tsx/UsersPage.tsx가 api/groups.ts의 listGroups()로 전환함 - 더 이상 이 파일을 import하는
// 곳이 없음. Claude가 디바이스 브리지로는 파일을 삭제할 수 없어서(delete 권한 없음) 내용만 비워둠 - 완전히
// 지우고 싶으면 이 파일(src/utils/groups.ts)을 직접 삭제해도 무방함.
export {}
