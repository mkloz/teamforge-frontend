// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "@/shared/components/ui/input";
import { InputOTP } from "@/shared/components/ui/input-otp";
import { NativeSelect } from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";

const COARSE_EDITABLE_CLASS = "[@media(pointer:coarse)]:text-base!";

class TestResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

globalThis.ResizeObserver = TestResizeObserver;

describe("coarse-pointer editable font contract", () => {
  it("covers shared text-editable controls without changing their geometry", () => {
    render(
      <>
        <Input aria-label="Name" className="text-xs" />
        <Textarea aria-label="About" />
        <NativeSelect aria-label="Timezone">
          <option>UTC</option>
        </NativeSelect>
        <InputOTP aria-label="Code" maxLength={6} />
      </>,
    );

    expect(screen.getByRole("textbox", { name: "Name" })).toHaveClass(
      COARSE_EDITABLE_CLASS,
    );
    expect(screen.getByRole("textbox", { name: "About" })).toHaveClass(
      COARSE_EDITABLE_CLASS,
    );
    expect(screen.getByRole("combobox", { name: "Timezone" })).toHaveClass(
      COARSE_EDITABLE_CLASS,
    );
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveClass(
      COARSE_EDITABLE_CLASS,
    );
  });
});
