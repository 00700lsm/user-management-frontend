import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeToken } from "../../../shared/mocks/fixtures";
import { isValidToken, rolesFrom, scheduleExpiry } from "./authToken";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("scheduleExpiry", () => {
  it("fires at the exp time, not before", () => {
    const onExpire = vi.fn();
    scheduleExpiry(makeToken("1", ["USER"], 10), onExpire);
    vi.advanceTimersByTime(8_000);
    expect(onExpire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2_500);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
  it("can be cancelled", () => {
    const onExpire = vi.fn();
    scheduleExpiry(makeToken("1", ["USER"], 10), onExpire)();
    vi.advanceTimersByTime(20_000);
    expect(onExpire).not.toHaveBeenCalled();
  });
  it("fires immediately for an already expired token and ignores tokens without exp", () => {
    const onExpire = vi.fn();
    scheduleExpiry(makeToken("1", ["USER"], -5), onExpire);
    vi.advanceTimersByTime(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    const none = vi.fn();
    scheduleExpiry("x.e30.y", none);
    vi.advanceTimersByTime(60_000);
    expect(none).not.toHaveBeenCalled();
  });
});

describe("token helpers", () => {
  it("validates exp and extracts roles", () => {
    expect(isValidToken(makeToken("1", ["ADMIN"], 60))).toBe(true);
    expect(isValidToken(makeToken("1", ["ADMIN"], -1))).toBe(false);
    expect(isValidToken("garbage")).toBe(false);
    expect(rolesFrom(makeToken("1", ["ADMIN"], 60))).toEqual(["ADMIN"]);
    expect(rolesFrom(makeToken("1", ["ADMIN"], -1))).toEqual([]);
  });
});
