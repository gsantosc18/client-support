"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/state/authStore";
import { injectStore } from "@/services/api";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    injectStore(storeRef.current);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
