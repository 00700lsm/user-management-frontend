import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../app/providers/AuthProvider";
import { makeToken } from "../../../shared/mocks/fixtures";
import { LoginPage } from "./LoginPage";

function setup(state?: unknown) {
  return render(<AuthProvider><MemoryRouter initialEntries={[{ pathname: "/login", state }]}>
    <Routes><Route path="/login" element={<LoginPage />} /><Route path="/me" element={<p>내 정보 화면</p>} /></Routes>
  </MemoryRouter></AuthProvider>);
}
const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole("button", { name: "로그인" }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("LoginPage", () => {
  it("blocks an empty submit and marks fields invalid", () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    setup();
    submit();
    expect(fetchMock).not.toHaveBeenCalled();
    const id = screen.getByLabelText("로그인 ID");
    expect(id).toHaveAttribute("aria-invalid", "true");
    expect(id).toHaveAccessibleDescription("로그인 ID를 입력해 주세요.");
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute("aria-invalid", "true");
  });
  it("shows the single Korean credential message on 401 and links it via aria-describedby", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "INVALID_CREDENTIALS", message: "Bad credentials" }), { status: 401 })));
    setup();
    type("로그인 ID", "inactive-user");
    type("비밀번호", "whatever");
    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("아이디 또는 비밀번호가 올바르지 않습니다.");
    expect(screen.queryByText(/Bad credentials/)).toBeNull();
    const id = screen.getByLabelText("로그인 ID");
    expect(id).toHaveAttribute("aria-invalid", "true");
    expect(id).toHaveAttribute("aria-describedby", "login-error");
  });
  it("logs in and navigates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ accessToken: makeToken("1", ["USER"], 60), tokenType: "bearer" }))));
    setup();
    type("로그인 ID", "dev-user");
    type("비밀번호", "pw");
    submit();
    await waitFor(() => expect(screen.getByText("내 정보 화면")).toBeInTheDocument());
    expect(sessionStorage.getItem("um_access_token")).not.toBeNull();
  });
  it("toggles password visibility", () => {
    setup();
    const pw = screen.getByLabelText("비밀번호");
    expect(pw).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 표시" }));
    expect(pw).toHaveAttribute("type", "text");
  });
  it("shows the expiry notice", () => {
    setup({ reason: "expired" });
    expect(screen.getByRole("status")).toHaveTextContent("로그인이 만료되었습니다. 다시 로그인해 주세요.");
  });
});
