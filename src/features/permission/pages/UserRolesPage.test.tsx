import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  return { fetchMock, client };
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
    const { fetchMock } = setup(catalog(), assignment(["USER"]));
    fireEvent.click(await screen.findByRole("checkbox", { name: /General user/ }));
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(screen.getByRole("alert")).toHaveTextContent("역할을 하나 이상 선택해 주세요.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not send a replacement when the selection is unchanged", async () => {
    const { fetchMock } = setup(catalog(), assignment(["USER"]));
    expect(await screen.findByRole("checkbox", { name: /General user/ })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(screen.getByRole("status")).toHaveTextContent("변경된 내용이 없습니다.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("PUTs the selected roles and shows the saved set", async () => {
    const { fetchMock } = setup(catalog(), assignment(["USER"]), assignment(["ADMIN", "USER"]));
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

  it.each([
    [400, "VALIDATION_FAILED", "duplicate role", "역할을 하나 이상, 중복 없이 선택해 주세요."],
    [403, "FORBIDDEN", "Access denied", "이 화면을 볼 권한이 없습니다."],
    [404, "NOT_FOUND", "missing", "사용자를 찾을 수 없습니다."],
  ] as const)("PUT %s shows the mapped form error and keeps the role form", async (status, code, raw, message) => {
    setup(catalog(), assignment(["USER"]), json({ code, message: raw }, status));
    fireEvent.click(await screen.findByRole("checkbox", { name: /Administrator/ }));
    fireEvent.click(screen.getByRole("button", { name: "권한 저장" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.getByRole("checkbox", { name: /General user/ })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Administrator/ })).toBeInTheDocument();
    expect(screen.queryByText(raw)).toBeNull();
  });

  it.each([
    [401, "로그인이 만료되었습니다. 다시 로그인해 주세요."],
    [403, "이 화면을 볼 권한이 없습니다."],
  ] as const)("a refetch that ends in %s hides the cached roles", async (status, message) => {
    const { client } = setup(
      catalog(),
      assignment(["USER"]),
      json({ code: "FORBIDDEN", message: "Access denied" }, status),
      json({ code: "FORBIDDEN", message: "Access denied" }, status),
    );
    expect(await screen.findByRole("checkbox", { name: /General user/ })).toBeChecked();

    await act(() => client.refetchQueries());
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/General user/)).toBeNull();
    expect(screen.queryByText(/Administrator/)).toBeNull();
    expect(screen.queryByText("Access denied")).toBeNull();
  });

  it("cancel returns to the user detail placeholder", async () => {
    setup(catalog(), assignment(["USER"]));
    fireEvent.click(await screen.findByRole("button", { name: "취소" }));
    expect(screen.getByRole("heading", { name: "사용자 상세" })).toBeInTheDocument();
  });
});
