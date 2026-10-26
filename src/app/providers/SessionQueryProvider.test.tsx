import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "../../features/user/pages/ProfilePage";
import { makeToken } from "../../shared/mocks/fixtures";
import { AuthProvider, useAuth } from "./AuthProvider";
import { SessionQueryProvider } from "./SessionQueryProvider";

const TOKEN_A = makeToken("1001", ["USER"], 900);
const TOKEN_B = makeToken("2002", ["USER"], 900);
const user = (id: number, loginId: string) =>
  ({ id, loginId, name: loginId, email: `${loginId}@example.test`, status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z" });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

function deferred() {
  let resolve!: (res: Response) => void;
  return { promise: new Promise<Response>(r => { resolve = r; }), resolve };
}

/** Routes fetch like the Backend: /users/me answers for whoever owns the Bearer token. */
function stubBackend(me: Record<string, () => Promise<Response>>) {
  const signals: Record<string, AbortSignal | undefined> = {};
  vi.stubGlobal("fetch", vi.fn((url: string, init: RequestInit = {}) => {
    if (url === "/api/auth/login") return Promise.resolve(json({ accessToken: TOKEN_B, tokenType: "Bearer" }));
    if (url === "/api/auth/logout") return Promise.resolve(new Response(null, { status: 204 }));
    const token = (init.headers as Record<string, string>).Authorization.replace("Bearer ", "");
    signals[token] = init.signal ?? undefined;
    return me[token]();
  }));
  return signals;
}

// Mirrors the app: protected pages render only while signed in, and the login form opens /me
// in the same update that stores the new token.
function Harness() {
  const auth = useAuth();
  const [isProfileOpen, setProfileOpen] = useState(true);
  const loginAsB = async () => { await auth.login("bob", "password-1234"); setProfileOpen(true); };
  return <>
    <button onClick={() => void auth.logout()}>logout</button>
    <button onClick={() => setProfileOpen(false)}>leave</button>
    <button onClick={() => void loginAsB()}>login-b</button>
    {auth.isAuthenticated && isProfileOpen && <ProfilePage />}
  </>;
}
function renderApp() {
  sessionStorage.setItem("um_access_token", TOKEN_A);
  render(<AuthProvider><SessionQueryProvider><Harness /></SessionQueryProvider></AuthProvider>);
}
const click = (name: string) => act(async () => { fireEvent.click(screen.getByRole("button", { name })); });

afterEach(() => { cleanup(); vi.unstubAllGlobals(); sessionStorage.clear(); });

describe("SessionQueryProvider: no server data crosses sessions", () => {
  it("logout then login as B: B's page starts empty instead of showing A's cached profile", async () => {
    const meB = deferred();
    stubBackend({ [TOKEN_A]: () => Promise.resolve(json(user(1001, "alice"))), [TOKEN_B]: () => meB.promise });
    renderApp();
    expect(await screen.findByText("alice@example.test")).toBeInTheDocument();

    await click("logout");
    await click("login-b");
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
    expect(screen.queryByText("alice@example.test")).toBeNull();

    await act(async () => meB.resolve(json(user(2002, "bob"))));
    expect(await screen.findByText("bob@example.test")).toBeInTheDocument();
  });

  it("login as B without a logout in between still opens /me on an empty cache", async () => {
    const meB = deferred();
    stubBackend({ [TOKEN_A]: () => Promise.resolve(json(user(1001, "alice"))), [TOKEN_B]: () => meB.promise });
    renderApp();
    expect(await screen.findByText("alice@example.test")).toBeInTheDocument();

    await click("leave");
    await click("login-b");
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
    expect(screen.queryByText("alice@example.test")).toBeNull();
  });

  it("A's slow response is aborted and never lands in B's session", async () => {
    const meA = deferred();
    const signals = stubBackend({ [TOKEN_A]: () => meA.promise, [TOKEN_B]: () => Promise.resolve(json(user(2002, "bob"))) });
    renderApp();
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");

    await click("logout");
    expect(signals[TOKEN_A]?.aborted).toBe(true);
    await click("login-b");
    expect(await screen.findByText("bob@example.test")).toBeInTheDocument();

    await act(async () => meA.resolve(json(user(1001, "alice")))); // arrives late anyway
    expect(screen.getByText("bob@example.test")).toBeInTheDocument();
    expect(screen.queryByText("alice@example.test")).toBeNull();
  });
});
