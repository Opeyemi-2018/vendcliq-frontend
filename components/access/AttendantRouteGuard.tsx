"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import { handleGetAttendantPermissions } from "@/lib/utils/api/apiHelper";
import {
  ATTENDANT_HOME,
  DENIED_PARAM,
  deniedMessage,
  ruleForPath,
  toPermissionMap,
} from "@/lib/access/attendantAccess";

/**
 * Screen-level backstop for attendant rules (the app's RequireAccess): nav
 * already hides what an attendant can't use, but a typed URL or stale link
 * could still land on a page. Those go back to the dashboard with a toast.
 *
 * Also refreshes the attendant's permissions once per load, so changes the
 * owner makes take effect without signing out and back in.
 */
export default function AttendantRouteGuard({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { user, isAttendant, canOpenPath, setAttendantPermissions } =
    useUser();
  // SSR has no localStorage (so no user): render as the server did until
  // mounted, then apply the rules.
  const [mounted, setMounted] = useState(false);
  const refreshed = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isAttendant || !user?.userId || refreshed.current) return;
    refreshed.current = true;
    handleGetAttendantPermissions(user.userId)
      .then((res) => {
        const data = res?.data;
        if (data && typeof data === "object") {
          setAttendantPermissions(toPermissionMap(data));
        }
      })
      .catch(() => {
        // Keep what sign-in stored; missing flags stay denied.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAttendant, user?.userId]);

  // Middleware redirects typed URLs here with ?denied=<feature>.
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has(DENIED_PARAM)) return;
    toast.error(deniedMessage(params.get(DENIED_PARAM)), {
      id: "attendant-denied",
    });
    params.delete(DENIED_PARAM);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [mounted, pathname]);

  const allowed = !mounted || canOpenPath(pathname);

  useEffect(() => {
    if (allowed) return;
    toast.error(deniedMessage(ruleForPath(pathname)?.feature), {
      id: "attendant-denied",
    });
    router.replace(ATTENDANT_HOME);
  }, [allowed, pathname, router]);

  return allowed ? <>{children}</> : null;
}
