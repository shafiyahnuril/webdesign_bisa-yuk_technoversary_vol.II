import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";
import { SITE } from "@/content/site";

export default function AboutPage() {
  usePageTheme("about");
  return (
    <>
      <PageHero title={COPY["page.about.title"]} eyebrow={SITE.subtheme} />
      <p className="t-body" style={{ padding: "0 var(--gutter-page)" }}>
        {COPY["page.wip"]}
      </p>
    </>
  );
}
