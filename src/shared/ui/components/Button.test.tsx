import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { describe, it, expect } from "vitest";
describe("Button", () => {
  it("renders an accessible label", () => {
    render(<Button type="button">저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });
});
