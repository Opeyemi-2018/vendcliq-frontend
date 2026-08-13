/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import Toggle from "@/components/business-settings/Toggle";
import { useStores } from "@/hooks/useStores";
import {
  handleGetAttendants,
  handleGetAttendantPermissions,
  handleAssignAttendantPermissions,
  handleUpdateAttendantPermissions,
} from "@/lib/utils/api/apiHelper";

interface AttendantRow {
  id: number;
  fullname: string;
  firstname?: string;
  lastname?: string;
  email: string;
  phone?: string;
  accountStatus?: string;
  storeIds?: string[];
}

/** The ten real permission flags, in the order the spec lists them. */
const PERMISSIONS: { key: string; label: string; paths: string[] }[] = [
  { key: "can_buy", label: "Can Buy", paths: ["M6 6h15l-1.5 9h-12z", "M6 6 5 3H2", "M9 20a1 1 0 1 0 2 0 1 1 0 1 0-2 0", "M16 20a1 1 0 1 0 2 0 1 1 0 1 0-2 0"] },
  { key: "can_sell", label: "Can Sell", paths: ["M3 7h18l-2 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z", "M8 7V5a4 4 0 0 1 8 0v2"] },
  { key: "can_update_stock", label: "Can Update Stock", paths: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"] },
  { key: "can_move_stock", label: "Can Move Stock", paths: ["M4 8h12", "m12 4 4 4-4 4", "M20 16H8", "m12 12-4 4 4 4"] },
  { key: "can_add_stock", label: "Can Add Stock", paths: ["M12 5v14", "M5 12h14"] },
  { key: "can_market_place", label: "Can Access Marketplace", paths: ["M4 9h16v11H4z", "m3 9 1.6-5h14.8L21 9", "M9.5 20v-5.5h5V20"] },
  { key: "can_push_to_market", label: "Can Push to Market", paths: ["M12 19V5", "m5 12 7-7 7 7"] },
  { key: "can_view_store_info", label: "Can View Store Info", paths: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"] },
  { key: "can_reporting", label: "Can View Reports", paths: ["M5 20V10", "M12 20V4", "M19 20v-7"] },
  { key: "can_expenses", label: "Can Manage Expenses", paths: ["M3 6h18v12H3z", "M3 10h18", "M7 15h4"] },
];

const EMPTY_PERMISSIONS = Object.fromEntries(
  PERMISSIONS.map((p) => [p.key, false]),
) as Record<string, boolean>;

/** Stable per-attendant avatar colour, so the same person keeps the same one. */
const AVATAR_COLOURS = [
  "#0A6DC0",
  "#4052A3",
  "#148264",
  "#B47800",
  "#8E44AD",
  "#C0392B",
];
const avatarBg = (id: number | string) => {
  const n = String(id)
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return AVATAR_COLOURS[n % AVATAR_COLOURS.length];
};

const initialsOf = (row: AttendantRow) => {
  const source =
    row.fullname?.trim() ||
    `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim() ||
    row.email;
  const parts = source.split(/\s+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return letters.toUpperCase();
};

/** "0803 ••• 4417" — the spec masks the middle digits. */
const maskPhone = (phone?: string) => {
  if (!phone) return "No phone on file";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  return `${digits.slice(0, 4)} ••• ${digits.slice(-4)}`;
};

const StatusChip = ({ active }: { active: boolean }) => (
  <span
    className="text-[12px] font-bold px-3 py-[5px] rounded-full shrink-0"
    style={
      active
        ? { background: "#E7F4EB", color: "#003909" }
        : { background: "#FFF3DB", color: "#85540A" }
    }
  >
    {active ? "Active" : "Pending"}
  </span>
);

const Glyph = ({ paths, colour }: { paths: string[]; colour: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke={colour}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

const CARD = "bg-white border border-[#E4E4E4] rounded-[20px]";
const EYEBROW =
  "text-[11px] font-bold tracking-[.6px] uppercase text-[#8E8E93]";

export const AttendantSettings = () => {
  const router = useRouter();
  const { data: stores = [] } = useStores();

  const [attendants, setAttendants] = useState<AttendantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [permissions, setPermissions] =
    useState<Record<string, boolean>>(EMPTY_PERMISSIONS);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await handleGetAttendants();
        const rows: AttendantRow[] = result?.data?.attendants ?? [];
        setAttendants(rows);
        if (rows.length > 0) setSelectedId(rows[0].id);
      } catch {
        toast.error("Could not load attendants");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Permissions are per attendant, so they reload with the selection.
  useEffect(() => {
    if (selectedId == null) {
      setPermissions(EMPTY_PERMISSIONS);
      return;
    }
    let cancelled = false;

    const load = async () => {
      setLoadingPermissions(true);
      try {
        const response = await handleGetAttendantPermissions(selectedId);
        const data = response?.data;
        if (cancelled) return;
        setPermissions(
          data && typeof data === "object"
            ? (Object.fromEntries(
                PERMISSIONS.map((p) => [p.key, Boolean(data[p.key])]),
              ) as Record<string, boolean>)
            : EMPTY_PERMISSIONS,
        );
      } catch {
        // No permission record yet — everything is off until saved.
        if (!cancelled) setPermissions(EMPTY_PERMISSIONS);
      } finally {
        if (!cancelled) setLoadingPermissions(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const storeName = useMemo(() => {
    const byId = new Map(stores.map((s) => [String(s.id), s.name]));
    return (ids?: string[]) => {
      const names = (ids ?? []).map((id) => byId.get(String(id))).filter(Boolean);
      if (names.length === 0) return "No store assigned";
      if (names.length === 1) return names[0] as string;
      return `${names.length} stores`;
    };
  }, [stores]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return attendants;
    return attendants.filter((a) =>
      `${a.fullname ?? ""} ${a.email ?? ""}`.toLowerCase().includes(q),
    );
  }, [attendants, search]);

  const isActive = (row: AttendantRow) =>
    (row.accountStatus ?? "").toUpperCase() === "ACTIVE";

  const selected = attendants.find((a) => a.id === selectedId) ?? null;
  const activeCount = attendants.filter(isActive).length;

  const save = async () => {
    if (!selected) {
      toast.error("Select an attendant first");
      return;
    }
    setSaving(true);

    const payload = {
      attendant_id: selected.id,
      ...(Object.fromEntries(
        PERMISSIONS.map((p) => [p.key, permissions[p.key] ?? false]),
      ) as any),
    };

    try {
      const res: any = await handleAssignAttendantPermissions(payload);
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        toast.success(`Permissions saved for ${selected.fullname}`);
        return;
      }

      // The API rejects a second create, so an existing record is updated.
      const message = String(res?.error || res?.message || res?.msg || "");
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("use update instead")
      ) {
        const update: any = await handleUpdateAttendantPermissions(payload);
        if (update?.statusCode === 200) {
          toast.success(`Permissions saved for ${selected.fullname}`);
        } else {
          toast.error(
            update?.error || update?.message || "Could not save permissions",
          );
        }
        return;
      }

      toast.error(message || "Could not save permissions");
    } catch (error: any) {
      toast.error(error?.message || "Could not save permissions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-5 items-start">
      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="flex-[1_1_340px] w-full min-w-0 sm:min-w-[300px] sm:max-w-[420px] flex flex-col gap-3.5">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Total", value: attendants.length, colour: "#2F2F2F" },
            { label: "Active", value: activeCount, colour: "#0E6E55" },
            {
              label: "Pending",
              value: attendants.length - activeCount,
              colour: "#B47800",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#E4E4E4] rounded-[16px] px-4 py-3.5"
            >
              <div className={EYEBROW}>{stat.label}</div>
              <div
                className="font-clash font-bold text-[24px] tracking-[-.5px] mt-1"
                style={{ color: stat.colour }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex-1 min-w-0 flex items-center gap-2.5 h-[46px] px-3.5 box-border rounded-[12px] border border-[#D8D8D8E6] bg-white">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendants"
              className="flex-1 min-w-0 border-none outline-none bg-transparent text-[14px] text-[#2F2F2F]"
            />
          </label>
          <button
            type="button"
            aria-label="Add attendant"
            onClick={() => router.push("/inventory/add-attendant")}
            className="w-[46px] h-[46px] rounded-[12px] border-none bg-[#0A6DC0] cursor-pointer inline-flex items-center justify-center shrink-0 hover:bg-[#09599A]"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        <div className={`${CARD} rounded-[18px] overflow-hidden`}>
          {loading ? (
            <div className="flex justify-center py-14">
              <ClipLoader size={26} color="#0A6DC0" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="font-bold text-[15px] text-[#2F2F2F]">
                No attendant found
              </div>
              <div className="text-[13px] text-[#8E8E93] mt-1">
                Try another name or add a new attendant.
              </div>
            </div>
          ) : (
            filtered.map((row) => {
              const active = row.id === selectedId;
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={`w-full box-border text-left cursor-pointer border-none border-b border-b-[#D8D8D873] px-[18px] py-4 flex items-center gap-3.5 ${
                    active ? "bg-[#F0F7FF]" : "bg-white hover:bg-[#F9FBFD]"
                  }`}
                >
                  <span
                    className="w-[46px] h-[46px] rounded-full inline-flex items-center justify-center text-white font-bold text-[14.5px] shrink-0"
                    style={{ background: avatarBg(row.id) }}
                  >
                    {initialsOf(row)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-[16px] font-bold tracking-[-.2px] truncate ${
                        active ? "text-[#0A6DC0]" : "text-[#2F2F2F]"
                      }`}
                    >
                      {row.fullname}
                    </span>
                    <span
                      className={`block text-[13px] mt-[3px] truncate ${
                        active ? "text-[#4C87EB]" : "text-[#8E8E93]"
                      }`}
                    >
                      Attendant · {storeName(row.storeIds)}
                    </span>
                  </span>
                  <StatusChip active={isActive(row)} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Permissions ──────────────────────────────────────────────────── */}
      <div className={`${CARD} flex-[2_1_440px] w-full min-w-0 sm:min-w-[320px] p-4 sm:p-[22px] flex flex-col gap-[18px]`}>
        {!selected ? (
          <div className="py-16 text-center text-[#8E8E93] text-[13.5px]">
            Select an attendant to manage what they can do.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 flex-wrap border border-[#D8D8D8B3] rounded-[16px] p-4">
              <span
                className="w-[52px] h-[52px] rounded-full inline-flex items-center justify-center text-white font-bold text-[16px] shrink-0"
                style={{ background: avatarBg(selected.id) }}
              >
                {initialsOf(selected)}
              </span>
              <div className="flex-[1_1_180px] min-w-0">
                <div className="text-[17px] font-bold tracking-[-.3px] text-[#2F2F2F]">
                  {selected.fullname}
                </div>
                <div className="text-[13px] text-[#8E8E93] mt-[3px] truncate">
                  Attendant · {storeName(selected.storeIds)} · {selected.email}
                </div>
                <div className="text-[13px] text-[#8E8E93] mt-0.5">
                  {maskPhone(selected.phone)}
                </div>
              </div>
              <StatusChip active={isActive(selected)} />
            </div>

            <div>
              <div className="text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93]">
                Permissions
              </div>
              <div className="text-[13px] text-[#8E8E93] mt-[5px]">
                Protect sensitive business data and actions.
              </div>
            </div>

            <div className="border border-[#D8D8D8B3] rounded-[16px] overflow-hidden">
              {loadingPermissions ? (
                <div className="flex justify-center py-14">
                  <ClipLoader size={24} color="#0A6DC0" />
                </div>
              ) : (
                PERMISSIONS.map((permission) => {
                  const on = permissions[permission.key] ?? false;
                  return (
                    <div
                      key={permission.key}
                      className="flex items-center gap-3 sm:gap-3.5 px-3 sm:px-4 min-h-[56px] py-[13px] border-b border-b-[#D8D8D873] bg-white last:border-b-0"
                    >
                      <span
                        className="w-10 h-10 rounded-[11px] inline-flex items-center justify-center shrink-0"
                        style={{ background: on ? "#E1EEFF" : "#F4F6F8" }}
                      >
                        <Glyph
                          paths={permission.paths}
                          colour={on ? "#0A6DC0" : "#8E8E93"}
                        />
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-[14px] sm:text-[15px] leading-[1.3] ${
                          on
                            ? "font-semibold text-[#2F2F2F]"
                            : "font-medium text-[#6E7480]"
                        }`}
                      >
                        {permission.label}
                      </span>
                      <Toggle
                        on={on}
                        label={permission.label}
                        onChange={(next) =>
                          setPermissions((prev) => ({
                            ...prev,
                            [permission.key]: next,
                          }))
                        }
                      />
                    </div>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving || loadingPermissions}
              className="w-full h-[54px] rounded-[13px] border-none bg-[#0A6DC0] text-white cursor-pointer text-[16px] font-bold inline-flex items-center justify-center gap-2.5 hover:bg-[#09599A] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <ClipLoader size={18} color="#fff" />
              ) : (
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
              )}
              <span>Save Attendant Permissions</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AttendantSettings;
