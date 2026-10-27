import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoleListPage } from "./RoleListPage";

const ROLES = [{ code: "ADMIN", name: "Administrator" }, { code: "USER", name: "General user" }];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function setup(response: Response | Error) {
  const fetchMock = vi.fn();
  if (response instanceof Error) fetchMock.mockRejectedValue(response);
  else fetchMock.mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  sessionStorage.setItem("um_access_token", "tok");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter><RoleListPage /></MemoryRouter></QueryClientProvider>);
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("RoleListPage (UI-PERM-001)", () => {
  it("shows a loading status, then the role catalog", async () => {
    setup(json(ROLES));
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
    expect(await screen.findByRole("cell", { name: "Administrator" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "General user" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "USER" })).toBeInTheDocument();
  });

  it("shows an empty state when the catalog has no roles", async () => {
    setup(json([]));
    expect(await screen.findByText("등록된 역할이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("403 shows the mapped message and no table", async () => {
    setup(json({ code: "FORBIDDEN", message: "Access denied" }, 403));
    expect(await screen.findByRole("alert")).toHaveTextContent("이 화면을 볼 권한이 없습니다.");
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByText("Access denied")).toBeNull();
  });
});
