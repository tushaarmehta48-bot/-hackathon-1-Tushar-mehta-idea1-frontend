import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { BookPageIntro } from "@/components/booking/book-page-intro";
import { BookFlowLoader } from "@/components/booking/book-flow-loader";

const BookFlow = dynamic(
  () => import("@/components/booking/book-flow").then((mod) => mod.BookFlow),
  { loading: () => <BookFlowLoader /> },
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("bookTitle"),
    description: t("bookDescription"),
  };
}

export default function BookPage() {
  return (
    <main id="main" className="flex flex-1 flex-col">
      <BookPageIntro />
      <div className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <BookFlow />
      </div>
    </main>
  );
}
