import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { COPY } from "@/content/copy";

export default function ContactPage() {
  usePageTheme("contact");
  return (
    <>
      <PageHero title={COPY["page.contact.title"]} />
      <p className="t-body" style={{ padding: "0 var(--gutter-page)" }}>
        {COPY["page.wip"]}
      </p>
    </>
  );
}
