import { useParams } from "react-router-dom";
import { ARTICLES } from "@/content/articles";
import NotFoundPage from "./NotFoundPage";
import { PageStub } from "./PageStub";

export default function ArticlePage() {
  const { slug } = useParams();
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return <NotFoundPage />;
  return <PageStub title={article.title} />;
}
