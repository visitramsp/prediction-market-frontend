import { Suspense } from "react";
import MarketSkeleton from "@/components/common/CartDetailLoader";
import Markets from "./Markets";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div>
          <MarketSkeleton />
        </div>
      }
    >
      <Markets targetId={slug} />
    </Suspense>
  );
}
