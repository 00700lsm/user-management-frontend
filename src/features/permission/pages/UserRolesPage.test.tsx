import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserRolesPage } from "./UserRolesPage";

const ROLES = [{ code: "ADMIN", name: "Administrator" }, { code: "USER", name: "General user" }];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function setup(...responses: (Response | Error)[]) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    if (response instanceof Error) fetchMock.mockRejectedValueOnce(response);
    else fetchMock.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetchMock);
  sessionStorage.setItem("um_access_token", "tok");
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/admin/users/1001/roles"]}>
    <Routes>
      <Route path="/admin/users/:id/roles" element={<UserRolesPage />} />
      <Route path="/admin/users/:id" element={<h1>사용자 상세</h1>} />
    </Routes>
  </MemoryRouter></QueryClientProvider>);
  return fetchMock;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });

const catalog = () => json(ROLES);
const assignment = (roleCodes: string[]) => json({ userId: 1001, roleCodes });

describe("UserRolesPage (UI-PERM-002)", () => {
  it("checks the user's current roles", async () => {
    setup(catalog(), assignment(["USER"]));
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
    const user = await screen.findByRole("checkbox", { name: /General user/ });
    expect(user).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Administrator/ })).not.toBeChecked();
    expect(screen.getByText(/현재 역할: General user/)).toBeInTheDocument();
  });

  it("blocks an empty selection and does not call PUT", async () => {
    const fetchMock = setup(catalog(), assignment(["USER"]));
    fireEvent.click(await screen.findByRole("checkbox", { name: /General user/ }));
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(screen.getByRole("alert")).toHaveTextContent("역할을 하나 이상 선택해 주세요.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not send a replacement when the selection is unchanged", async () => {
    const fetchMock = setup(catalog(), assignment(["USER"]));
    expect(await screen.findByRole("checkbox", { name: /General user/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(screen.getByRole("status")).toHaveTextContent("변경된 내용이 없습니다.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("PUTs the selected roles and shows the saved set", async () => {
    const fetchMock = setup(catalog(), assignment(["USER"]), assignment(["ADMIN", "USER"]));
    fireEvent.click(await screen.findByRole("checkbox", { name: /Administrator/ }));
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(await screen.findByRole("status")).toHaveTextContent("역할을 저장했습니다.");
    expect(screen.getByRole("checkbox", { name: /Administrator/ })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: /General user/ })).toBeChecked();
    const init = fetchMock.mock.calls[2][1] as RequestInit;
    expect(fetchMock.mock.calls[2][0]).toBe("/api/admin/users/1001/roles");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toEqual({ roleCodes: ["ADMIN", "USER"] });
  });

  it("404 shows the mapped message and no role form", async () => {
    setup(catalog(), json({ code: "NOT_FOUND", message: "missing" }, 404));
    expect(await screen.findByRole("alert")).toHaveTextContent("사용자를 찾을 수 없습니다.");
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText("missing")).toBeNull();
  });

  it("cancel returns to the user detail placeholder", async () => {
    setup(catalog(), assignment(["USER"]));
    fireEvent.click(await screen.findByRole("button", { name: "취소" }));
    expect(screen.getByRole("heading", { name: "사용자 상세" })).toBeInTheDocument();
  });
});
