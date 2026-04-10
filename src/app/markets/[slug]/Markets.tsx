"use client";

import Details from "@/components/Pages/detail/page";

export default function Markets({ targetId }: { targetId: string }) {
  return <Details marketId={targetId} />;
}
