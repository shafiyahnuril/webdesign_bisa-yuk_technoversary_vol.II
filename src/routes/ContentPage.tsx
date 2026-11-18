import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";

export default function ContentPage() {
  usePageTheme("konten");
  return (
    <>
      <PageHero title={COPY["page.content.title"]} />
      <p className="t-body" style={{ padding: "0 var(--gutter-page)" }}>
        {COPY["page.wip"]}
      </p>
    </>
  );
}
