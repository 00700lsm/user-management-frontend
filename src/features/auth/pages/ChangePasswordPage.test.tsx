import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../app/providers/AuthProvider";
import { makeToken } from "../../../shared/mocks/fixtures";
import { ChangePasswordPage } from "./ChangePasswordPage";

function setup() {
  sessionStorage.setItem("um_access_token", makeToken("1", ["USER"], 600));
  return render(<AuthProvider><MemoryRouter initialEntries={["/settings/password"]}>
    <Routes><Route path="/settings/password" element={<ChangePasswordPage />} /><Route path="/login" element={<p>로그인 화면</p>} /></Routes>
  </MemoryRouter></AuthProvider>);
}
function fill(oldPw: string, newPw: string, confirm: string) {
  fireEvent.change(screen.getByLabelText("이전 비밀번호"), { target: { value: oldPw } });
  fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: newPw } });
  fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: confirm } });
  fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.useRealTimers(); sessionStorage.clear(); });

describe("ChangePasswordPage", () => {
  it("shows the policy hint and blocks short / mismatched input without calling the API", () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    setup();
    expect(screen.getByLabelText("새 비밀번호")).toHaveAccessibleDescription("12자 이상 입력해 주세요.");
    fill("old-password", "short", "different");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("새 비밀번호")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("새 비밀번호 확인")).toHaveAccessibleDescription("새 비밀번호가 일치하지 않습니다.");
  });
  it("blocks confirm mismatch for a valid new password", () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    setup();
    fill("old-password", "new-password-123", "new-password-124");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("새 비밀번호 확인")).toHaveAttribute("aria-invalid", "true");
  });
  it("400 keeps the session and shows the mapped message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: "INVALID_OLD_PASSWORD", message: "Old password mismatch" }), { status: 400 })));
    setup();
    fill("wrong-old-pw", "new-password-123", "new-password-123");
    expect(await screen.findByRole("alert")).toHaveTextContent("이전 비밀번호가 올바르지 않습니다.");
    expect(screen.getByLabelText("이전 비밀번호")).toHaveAttribute("aria-invalid", "true");
    expect(sessionStorage.getItem("um_access_token")).not.toBeNull();
    expect(screen.queryByText("로그인 화면")).toBeNull();
  });
  it("204 shows completion, then clears the session and navigates to /login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setup();
    fill("old-password", "new-password-123", "new-password-123");
    expect(await screen.findByRole("status")).toHaveTextContent("비밀번호가 변경되었습니다");
    expect(sessionStorage.getItem("um_access_token")).not.toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    expect(screen.getByText("로그인 화면")).toBeInTheDocument();
    expect(sessionStorage.getItem("um_access_token")).toBeNull();
  });
});
