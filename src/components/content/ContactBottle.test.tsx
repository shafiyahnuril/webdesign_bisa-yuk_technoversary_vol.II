import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { COPY } from "@/content/copy";
import { ContactBottle, bottleFill } from "./ContactBottle";
import { ContactForm } from "./ContactForm";

describe("ContactBottle", () => {
  it("tinggi air naik dari 0 sampai 3 kolom valid dan dibatasi di luar rentang", () => {
    expect([0, 1, 2, 3].map(bottleFill)).toEqual([0, 1 / 3, 2 / 3, 1]);
    expect(bottleFill(-2)).toBe(0);
    expect(bottleFill(9)).toBe(1);
    expect(bottleFill(Number.NaN)).toBe(0);
  });

  it("menulis --fill dan data-level, murni hiasan (aria-hidden)", () => {
    const { container, rerender } = render(<ContactBottle level={0} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.dataset.level).toBe("0");
    expect(root.style.getPropertyValue("--fill")).toBe("0");
    for (const level of [1, 2, 3]) {
      rerender(<ContactBottle level={level} />);
      expect(root.dataset.level).toBe(String(level));
      expect(Number(root.style.getPropertyValue("--fill"))).toBeCloseTo(level / 3, 5);
    }
    expect(root.querySelector("a, button, input, [tabindex]")).toBeNull();
  });
});

describe("ContactForm: kemajuan dan label", () => {
  it("melaporkan jumlah kolom valid 0 sampai 3, lalu done saat sukses (mode cadangan)", () => {
    const onProgress = vi.fn();
    render(<ContactForm endpoint="" email="t@c.id" openMailto={vi.fn()} onProgress={onProgress} />);
    const last = () =>
      onProgress.mock.calls[onProgress.mock.calls.length - 1]![0] as {
        valid: number;
        done: boolean;
      };
    expect(last()).toEqual({ valid: 0, done: false });

    fireEvent.change(screen.getByLabelText(COPY["contact.field.name"]), {
      target: { value: "Ani" },
    });
    expect(last().valid).toBe(1);
    fireEvent.change(screen.getByLabelText(COPY["contact.field.email"]), {
      target: { value: "ani@contoh.id" },
    });
    expect(last().valid).toBe(2);
    fireEvent.change(screen.getByLabelText(COPY["contact.field.message"]), {
      target: { value: "Halo, ini pesan uji." },
    });
    expect(last()).toEqual({ valid: 3, done: false });

    fireEvent.click(screen.getByRole("button", { name: COPY["contact.submit"] }));
    expect(last().done).toBe(true);
  });

  it("tiap kolom isian tetap berlabel dan terhubung lewat for/id", () => {
    render(<ContactForm endpoint="" email="t@c.id" />);
    for (const key of [
      "contact.field.name",
      "contact.field.email",
      "contact.field.message",
    ] as const) {
      const control = screen.getByLabelText(COPY[key]);
      const label = document.querySelector(`label[for="${control.id}"]`);
      expect(label?.textContent).toBe(COPY[key]);
    }
  });
});
