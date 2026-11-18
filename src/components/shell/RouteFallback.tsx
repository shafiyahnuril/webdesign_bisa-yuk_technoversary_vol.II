import { COPY } from "@/content/copy";

export function RouteFallback() {
  return (
    <p role="status" className="sr-only">
      {COPY["page.loading"]}
    </p>
  );
}
