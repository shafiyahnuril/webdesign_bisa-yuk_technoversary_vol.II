import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { COPY } from "@/content/copy";
import { ContactForm, RESEND_LOCK_MS } from "./ContactForm";
import { validateAll, validateField } from "./contact-validate";

describe("contact-validate", () => {
  it("nama 2–80 karakter, dipangkas", () => {
    expect(validateField("name", "A")).toBe("Nama minimal 2 karakter.");
    expect(validateField("name", "  A ")).toBe("Nama minimal 2 karakter.");
    expect(validateField("name", "Al")).toBeNull();
    expect(validateField("name", "x".repeat(80))).toBeNull();
    expect(validateField("name", "x".repeat(81))).toBe(COPY["contact.error.name.max"]);
  });
  it("email: format longgar", () => {
    for (const bad of ["", "a", "a@b", "a@b.", "a b@c.id", "@c.id"]) {
      expect(validateField("email", bad)).toBe("Format email belum benar.");
    }
    expect(validateField("email", "a@b.id")).toBeNull();
  });
  it("pesan 10–1000 karakter", () => {
    expect(validateField("message", "x".repeat(9))).toBe("Pesan minimal 10 karakter.");
    expect(validateField("message", "x".repeat(10))).toBeNull();
    expect(validateField("message", "x".repeat(1000))).toBeNull();
    expect(validateField("message", "x".repeat(1001))).toBe(COPY["contact.error.message.max"]);
  });
  it("validateAll mengumpulkan semua galat", () => {
    expect(Object.keys(validateAll({ name: "", email: "", message: "" }))).toEqual([
      "name",
      "email",
      "message",
    ]);
    expect(validateAll({ name: "Ani", email: "a@b.id", message: "Halo, ini pesan." })).toEqual({});
  });
});

function fill(name = "Ani", email = "ani@contoh.id", message = "Halo, ini pesan uji.") {
  fireEvent.change(screen.getByLabelText(COPY["contact.field.name"]), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(COPY["contact.field.email"]), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(COPY["contact.field.message"]), {
    target: { value: message },
  });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: COPY["contact.submit"] }));

describe("ContactForm", () => {
  beforeEach(() => vi.useRealTimers());
  afterEach(() => vi.unstubAllGlobals());

  it("validasi saat blur: aria-invalid dan aria-describedby ke galat", () => {
    render(<ContactForm endpoint="" email="tim@contoh.id" />);
    const name = screen.getByLabelText(COPY["contact.field.name"]);
    fireEvent.change(name, { target: { value: "A" } });
    fireEvent.blur(name);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    const id = name.getAttribute("aria-describedby")!;
    expect(document.getElementById(id)?.textContent).toBe("Nama minimal 2 karakter.");
  });

  it("kirim kosong: tidak mengirim, ringkasan galat menerima fokus", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm endpoint="https://f.test/x" email="tim@contoh.id" />);
    submit();
    expect(fetchMock).not.toHaveBeenCalled();
    const summary = screen.getByText(COPY["contact.error.summary"]).parentElement!;
    expect(document.activeElement).toBe(summary);
    expect(summary.textContent).toContain("Format email belum benar.");
  });

  it("penghitung pesan 0/1000", () => {
    render(<ContactForm endpoint="" email="tim@contoh.id" />);
    expect(screen.getByText("0/1000")).toBeTruthy();
    fill("Ani", "ani@contoh.id", "12345");
    expect(screen.getByText("5/1000")).toBeTruthy();
  });

  it("mode cadangan: membuka mailto dengan isi pesan dan menampilkan catatan", () => {
    const openMailto = vi.fn();
    render(<ContactForm endpoint="" email="tim@contoh.id" openMailto={openMailto} />);
    expect(screen.getByText(`${COPY["contact.fallback"]}.`)).toBeTruthy();
    fill();
    submit();
    expect(openMailto).toHaveBeenCalledTimes(1);
    const url = openMailto.mock.calls[0]![0] as string;
    expect(url.startsWith("mailto:tim@contoh.id?subject=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Halo, ini pesan uji.");
    expect(screen.getByRole("status").textContent).toBe(COPY["contact.fallback.opened"]);
  });

  it("sukses: fetch POST FormData + Accept JSON, pesan sukses, tombol terkunci 5 detik", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm endpoint="https://f.test/x" email="tim@contoh.id" />);
    fill();
    submit();
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(COPY["contact.success"]),
    );
    const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
    expect(url).toBe("https://f.test/x");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Accept).toBe("application/json");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("email")).toBe("ani@contoh.id");

    const again = screen.getByRole("button", { name: COPY["contact.again"] });
    expect((again as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RESEND_LOCK_MS + 10);
    });
    await waitFor(() => expect((again as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(again);
    expect(screen.getByLabelText(COPY["contact.field.name"])).toBeTruthy();
    vi.useRealTimers();
  });

  it("sending: tombol nonaktif dan klik ganda tidak mengirim dua kali", async () => {
    let resolve!: (v: { ok: boolean }) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise((r) => (resolve = r)));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ContactForm endpoint="https://f.test/x" email="t@c.id" />);
    fill();
    submit();
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText(COPY["contact.sending"])).toBeTruthy();
    expect((container.querySelector("button[type=submit]") as HTMLButtonElement).disabled).toBe(
      true,
    );
    await act(async () => resolve({ ok: true }));
    await waitFor(() => expect(screen.getByText(COPY["contact.success"])).toBeTruthy());
  });

  it("galat jaringan dan respons non-OK: banner muncul, isian tidak hilang", async () => {
    for (const mock of [
      vi.fn().mockRejectedValue(new Error("offline")),
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    ]) {
      vi.stubGlobal("fetch", mock);
      const { unmount } = render(<ContactForm endpoint="https://f.test/x" email="t@c.id" />);
      fill();
      submit();
      await waitFor(() => expect(screen.getByText(COPY["contact.error.generic"])).toBeTruthy());
      expect(
        (screen.getByLabelText(COPY["contact.field.message"]) as HTMLTextAreaElement).value,
      ).toBe("Halo, ini pesan uji.");
      // Tombol aktif lagi untuk mencoba ulang.
      expect(
        (screen.getByRole("button", { name: COPY["contact.submit"] }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      unmount();
    }
  });

  it("kolom jebakan terisi: tidak mengirim apa pun", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ContactForm endpoint="https://f.test/x" email="t@c.id" />);
    fill();
    fireEvent.change(container.querySelector("input[name=_gotcha]")!, {
      target: { value: "bot" },
    });
    submit();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
