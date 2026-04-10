import { Suspense } from "react";
import RefRegister from "./RefRegister";
import MarketSkeleton from "@/components/common/CartDetailLoader";

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
      <RefRegister userIdWithRef={slug} />
    </Suspense>
  );
}
