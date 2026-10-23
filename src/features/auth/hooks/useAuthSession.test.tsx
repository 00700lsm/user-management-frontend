import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../../../app/providers/AuthProvider";
import { makeToken } from "../../../shared/mocks/fixtures";

function Probe() {
  const auth = useAuth();
  return <p>{auth.isAuthenticated ? "in" : "out"}</p>;
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); sessionStorage.clear(); });

describe("AuthProvider expiry", () => {
  it("clears the session through the 401 event when exp passes", () => {
    sessionStorage.setItem("um_access_token", makeToken("1", ["USER"], 5));
    const onUnauthorized = vi.fn();
    window.addEventListener("um:unauthorized", onUnauthorized);
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText("in")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(6_000); });
    expect(screen.getByText("out")).toBeInTheDocument();
    expect(sessionStorage.getItem("um_access_token")).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener("um:unauthorized", onUnauthorized);
  });
  it("discards an already expired token on load", () => {
    sessionStorage.setItem("um_access_token", makeToken("1", ["USER"], -5));
    render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByText("out")).toBeInTheDocument();
    expect(sessionStorage.getItem("um_access_token")).toBeNull();
  });
});
