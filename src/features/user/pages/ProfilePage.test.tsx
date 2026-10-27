import { act, cleanup, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "./ProfilePage";

const ME = { id: 1001, loginId: "dev-user", name: "사용자 예시", email: "user@example.test", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z" };

/** Each fetch call gets the next response in order. Returns the client so a test can refetch. */
function setup(...responses: (Response | Error)[]) {
  const f = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) f.mockRejectedValueOnce(r);
    else f.mockResolvedValueOnce(r);
  }
  vi.stubGlobal("fetch", f);
  sessionStorage.setItem("um_access_token", "tok");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>);
  return client;
}
const profileRegion = () => screen.queryByRole("region", { name: "프로필 정보" });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("ProfilePage (UI-USER-002, read)", () => {
  it("shows a loading status, then the profile from GET /users/me", async () => {
    setup(new Response(JSON.stringify(ME), { status: 200 }));
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");

    const profile = await screen.findByRole("region", { name: "프로필 정보" });
    const value = (term: string) => within(profile).getByText(term).nextElementSibling;
    expect(value("로그인 ID")).toHaveTextContent("dev-user");
    expect(value("이름")).toHaveTextContent("사용자 예시");
    expect(value("이메일")).toHaveTextContent("user@example.test");
    expect(value("상태")).toHaveTextContent("활성");
    // createdAt is shown as a date in Korea time, not the raw ISO string
    expect(value("가입일")).toHaveTextContent("2026. 1. 1.");
    expect(screen.queryByText("2026-01-01T00:00:00Z")).toBeNull();
  });

  it("403 shows the mapped message and no profile", async () => {
    setup(new Response(JSON.stringify({ code: "FORBIDDEN", message: "Access denied" }), { status: 403 }));
    // must differ from the Shell re-login banner text (e2e "403 shows the re-login notice" expects one match)
    expect(await screen.findByRole("alert")).toHaveTextContent("이 정보를 볼 권한이 없습니다.");
    expect(profileRegion()).toBeNull();
    expect(screen.queryByText("Access denied")).toBeNull();
  });

  it("network failure shows the fallback message", async () => {
    setup(new TypeError("Failed to fetch"));
    expect(await screen.findByRole("alert")).toHaveTextContent("요청을 처리하지 못했습니다");
  });

  it("a refetch that ends in 403 hides the profile that was on screen", async () => {
    const client = setup(new Response(JSON.stringify(ME), { status: 200 }),
      new Response(JSON.stringify({ code: "FORBIDDEN", message: "Access denied" }), { status: 403 }));
    expect(await screen.findByRole("region", { name: "프로필 정보" })).toBeInTheDocument();

    await act(() => client.refetchQueries());
    expect(await screen.findByRole("alert")).toHaveTextContent("이 정보를 볼 권한이 없습니다.");
    expect(profileRegion()).toBeNull();
    expect(screen.queryByText("user@example.test")).toBeNull();
  });

  it("a refetch that fails on the network keeps the last profile under the error", async () => {
    const client = setup(new Response(JSON.stringify(ME), { status: 200 }), new TypeError("Failed to fetch"));
    expect(await screen.findByRole("region", { name: "프로필 정보" })).toBeInTheDocument();

    await act(() => client.refetchQueries());
    expect(await screen.findByRole("alert")).toHaveTextContent("요청을 처리하지 못했습니다");
    expect(profileRegion()).toBeInTheDocument();
  });
});
