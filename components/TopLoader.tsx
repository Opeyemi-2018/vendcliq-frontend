"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";

const TopLoader = () => {
  const ref = useRef<LoadingBarRef | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const loader = ref.current;

    if (loader) {
      loader.continuousStart();
    }

    const timer = setTimeout(() => {
      if (loader) {
        loader.complete();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <LoadingBar
      color="#0A6DC0"
      ref={ref}
      shadow={true}
      height={3}
    />
  );
};

export default TopLoader;
