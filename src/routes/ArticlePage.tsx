import { useParams } from "react-router-dom";
import { PageHero } from "@/components/ui/PageHero";
import { usePageTheme } from "@/components/ui/usePageTheme";
import { ARTICLES } from "@/content/articles";
import { COPY } from "@/content/copy";
import NotFoundPage from "./NotFoundPage";

export default function ArticlePage() {
  const { slug } = useParams();
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFoundPage />;
  return <ArticleView title={article.title} />;
}

function ArticleView({ title }: { title: string }) {
  usePageTheme("artikel");
  return (
    <>
      <PageHero title={title} />
      <p className="t-body" style={{ padding: "0 var(--gutter-page)" }}>
        {COPY["page.wip"]}
      </p>
    </>
  );
}
