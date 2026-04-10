import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import GlobalLoader from "@/components/common/Loader";
import AuthGuard from "@/components/AuthGuard";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <AuthGuard>
        {" "}
        <ProfileClient targetId={params.slug} />
      </AuthGuard>
    </Suspense>
  );
}
