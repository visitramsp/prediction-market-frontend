"use client";

import Register from "@/components/Pages/auth/register";

export default function RefRegister({
  userIdWithRef,
}: {
  userIdWithRef: string;
}) {
  return <Register refId={userIdWithRef} />;
}
