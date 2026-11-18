import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COPY } from "@/content/copy";
import { TeamGrid } from "./TeamGrid";

describe("TeamGrid", () => {
  it("menampilkan kartu placeholder rapi, bukan teks TODO mentah", () => {
    const { container } = render(
      <TeamGrid
        members={[
          { name: "TODO", role: "TODO", institution: "TODO" },
          { name: "TODO", role: "TODO", institution: "TODO" },
        ]}
      />,
    );
    expect(screen.getAllByText(COPY["about.team.placeholder.name"])).toHaveLength(2);
    expect(screen.getAllByText(COPY["about.team.placeholder.role"])).toHaveLength(2);
    expect(container.textContent).not.toContain("TODO");
  });

  it("menampilkan data anggota yang sudah terisi", () => {
    render(<TeamGrid members={[{ name: "Contoh Nama", role: "Peran Contoh", institution: "Kampus Contoh" }]} />);
    expect(screen.getByText("Contoh Nama")).toBeTruthy();
    expect(screen.getByText("Kampus Contoh")).toBeTruthy();
  });
});
