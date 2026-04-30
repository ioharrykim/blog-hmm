import { loginAction } from "@/app/admin/login/actions";

export const dynamic = "force-dynamic";

export default function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main className="login-page">
      <form className="login-form" action={loginAction}>
        <div className="page__kicker">Quiet entry</div>
        <h1 className="page__title">관리자 로그인</h1>
        <p className="page__lede">글과 페이지를 수정하기 위한 조용한 입구입니다.</p>
        <LoginError searchParams={searchParams} />
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>
        <button className="button button--primary" type="submit">
          로그인 →
        </button>
      </form>
    </main>
  );
}

async function LoginError({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  if (!params.error) return null;
  return <p className="form-error">아이디 또는 비밀번호가 맞지 않습니다.</p>;
}
