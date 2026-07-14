import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SuggestionButtons } from "@/components/SuggestionButtons";
import { Button } from "@/components/ui/Button";

describe("LanguageSelector", () => {
  it("has an accessible label and exposes every supported language", () => {
    render(<LanguageSelector value="auto" onChange={vi.fn()} />);

    const select = screen.getByRole("combobox", { name: /reply in/i });
    expect(select).toHaveValue("auto");
    expect(screen.getAllByRole("option")).toHaveLength(6);
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Español" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "العربية" })).toBeInTheDocument();
  });

  it("reports a user-selected language", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LanguageSelector value="auto" onChange={onChange} />);

    await user.selectOptions(screen.getByRole("combobox", { name: /reply in/i }), "fr");

    expect(onChange).toHaveBeenCalledWith("fr");
  });
});

describe("SuggestionButtons", () => {
  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SuggestionButtons
        suggestions={["Accessible restroom", "Bag policy"]}
        onSelect={onSelect}
      />
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Accessible restroom" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("Accessible restroom");
  });

  it("prevents selection while the assistant is busy", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SuggestionButtons suggestions={["Bag policy"]} onSelect={onSelect} disabled />
    );

    const button = screen.getByRole("button", { name: "Bag policy" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe("Button", () => {
  it("forwards native semantics, state, and refs", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} type="submit" variant="danger" disabled>
        Stop operation
      </Button>
    );

    const button = screen.getByRole("button", { name: "Stop operation" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-red-600");
    expect(ref.current).toBe(button);
  });
});
