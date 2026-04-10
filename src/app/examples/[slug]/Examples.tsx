"use client";

import Details from "@/components/Pages/detail/page";

export default function Examples({ targetId }: { targetId: string }) {
  return <Details marketId={targetId} />;
}
