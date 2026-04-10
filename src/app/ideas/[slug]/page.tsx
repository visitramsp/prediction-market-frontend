import { Suspense } from "react";
import IdeasDetails from "./IdeasDetails";
import GlobalLoader from "@/components/common/Loader";
import AuthGuard from "@/components/AuthGuard";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <Suspense fallback={<GlobalLoader />}>
      <AuthGuard>
        {" "}
        <IdeasDetails targetId={slug} />
      </AuthGuard>
    </Suspense>
  );
}
