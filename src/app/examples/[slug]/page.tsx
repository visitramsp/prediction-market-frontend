import { Suspense } from "react";
import MarketSkeleton from "@/components/common/CartDetailLoader";
import Examples from "./Examples";

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
      <Examples targetId={slug} />
    </Suspense>
  );
}
