"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import { setKeysReady } from "../../../store/slice/chat";
import { useE2EInit } from "./useE2EInit";

export default function E2EProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector(
    (state: RootState) => state.user?.token
  ) as string | null;

  const { keysReady, error } = useE2EInit(!!token);

  useEffect(() => {
    if (keysReady) {
      dispatch(setKeysReady(true));
    }
  }, [keysReady, dispatch]);

  if (error) {
    console.warn("E2E key init error (background):", error);
  }

  return <>{children}</>;
}
