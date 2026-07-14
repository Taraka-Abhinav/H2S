import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FanContextControls } from "@/components/FanContextControls";
import { InsightCard } from "@/components/InsightCard";
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

describe("FanContextControls", () => {
  it("reports only typed location and accessibility preferences", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FanContextControls
        value={{ currentLocation: "unsure", accessPreference: "standard" }}
        onChange={onChange}
      />
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Current location" }),
      "rail_station"
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Route preference" }),
      "step_free"
    );

    expect(onChange).toHaveBeenNthCalledWith(1, {
      currentLocation: "rail_station",
      accessPreference: "standard",
    });
    expect(onChange).toHaveBeenNthCalledWith(2, {
      currentLocation: "unsure",
      accessPreference: "step_free",
    });
  });

  it("disables both context controls while a response is streaming", () => {
    render(
      <FanContextControls
        value={{ currentLocation: "west_plaza", accessPreference: "low_sensory" }}
        onChange={vi.fn()}
        disabled
      />
    );

    expect(screen.getByRole("group", { name: "Route context" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Current location" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Route preference" })).toBeDisabled();
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

describe("InsightCard action workflow", () => {
  const insight = {
    priority: "high" as const,
    zone: "Zone C",
    issue: "West concourse pressure is critical.",
    recommendation: "Prepare Gate C2 after control-room confirmation.",
    owner: "control_room" as const,
    recheckMinutes: 2,
  };

  it("shows accountability metadata and advances human approval actions", async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    const { rerender } = render(
      <InsightCard insight={insight} onStatusChange={onStatusChange} />
    );

    expect(screen.getByText("Control room")).toBeVisible();
    expect(screen.getByText("In 2 min")).toBeVisible();
    expect(screen.getByText("pending")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Acknowledge" }));
    expect(onStatusChange).toHaveBeenLastCalledWith("acknowledged");

    rerender(
      <InsightCard
        insight={insight}
        status="acknowledged"
        onStatusChange={onStatusChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "Mark resolved" }));
    expect(onStatusChange).toHaveBeenLastCalledWith("resolved");

    rerender(
      <InsightCard
        insight={insight}
        status="resolved"
        onStatusChange={onStatusChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "Reopen" }));
    expect(onStatusChange).toHaveBeenLastCalledWith("pending");
  });
});
