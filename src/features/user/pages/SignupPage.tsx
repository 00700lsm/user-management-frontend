import { Link } from "react-router-dom";
export function SignupPage() {
  return <main className="login">
    <section className="card" style={{ width: "min(100%, 480px)" }}>
      <h1>회원가입</h1>
      <p className="muted">User · UI-USER-001</p>
      <p>화면 경로만 준비됐습니다. 가입·Auth 자격증명·기본 USER 역할 생성은 Backend 통합 구현 후 연결합니다.</p>
      <Link to="/login">로그인으로</Link>
    </section>
  </main>;
}
