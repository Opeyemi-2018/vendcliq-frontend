/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import Toggle from "@/components/business-settings/Toggle";
import {
  useStores,
  useStoreById,
  useUpdateStore,
  useUpdateStoreSettings,
} from "@/hooks/useStores";

interface StoreForm {
  name: string;
  phone: string;
  address: { name: string; lat: number; lng: number };
}

interface StoreFlags {
  is_default: boolean;
  show_on_marketplace: boolean;
  is_archived: boolean;
  allow_credit_sales: boolean;
}

const FLAGS: { key: keyof StoreFlags; label: string; sub: string }[] = [
  {
    key: "is_default",
    label: "Make default store",
    sub: "New sales default to this store",
  },
  {
    key: "show_on_marketplace",
    label: "Show on Marketplace",
    sub: "Display products on Vendcliq Marketplace",
  },
  {
    key: "is_archived",
    label: "Temporary archive store",
    sub: "Hide store without deleting data",
  },
  {
    key: "allow_credit_sales",
    label: "Enable Credit sales",
    sub: "Allow selling on credit at this store",
  },
];

const EMPTY_FLAGS: StoreFlags = {
  is_default: false,
  show_on_marketplace: false,
  is_archived: false,
  allow_credit_sales: false,
};

const EYEBROW =
  "text-[11.5px] font-bold tracking-[.6px] uppercase text-[#8E8E93] mb-2.5";
const FIELD =
  "box-border w-full bg-[#F8F9FA] border border-[#D8D8D899] rounded-[12px] px-4 py-[15px] text-[15px] text-[#2F2F2F] outline-none focus:border-[#0A6DC0] focus:bg-white";

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const StoreSettings = () => {
  const { data: stores = [], isLoading } = useStores();
  const updateStore = useUpdateStore();
  const updateSettings = useUpdateStoreSettings();

  const [storeId, setStoreId] = useState<string>("");
  // The list endpoint carries no preference flags — those live in the detail
  // response under `settings`, so the form hydrates from there.
  const { data: detail, isLoading: loadingDetail } = useStoreById(storeId);
  const [form, setForm] = useState<StoreForm>({
    name: "",
    phone: "",
    address: { name: "", lat: 0, lng: 0 },
  });
  const [flags, setFlags] = useState<StoreFlags>(EMPTY_FLAGS);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const selected = useMemo(
    () => stores.find((s) => String(s.id) === storeId) ?? null,
    [stores, storeId],
  );

  useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(String(stores[0].id));
  }, [stores, storeId]);

  // Reset the form whenever a different store is picked.
  useEffect(() => {
    if (!detail) return;
    const store = detail as any;
    const settings = store.settings ?? {};
    setForm({
      name: store.name ?? "",
      phone: store.phone ?? "",
      address: {
        name: store.address?.name ?? "",
        lat: store.address?.lat ?? 0,
        lng: store.address?.lng ?? 0,
      },
    });
    setFlags({
      is_default: Boolean(settings.is_default),
      show_on_marketplace: Boolean(settings.show_on_marketplace),
      is_archived: Boolean(settings.is_archived),
      allow_credit_sales: Boolean(
        settings.allow_credit_sales ?? store.credit_store,
      ),
    });
    setEmails(settings.credit_sale_auth_emails ?? []);
    setEmailDraft("");
  }, [detail]);

  const addEmail = () => {
    const value = emailDraft.trim().toLowerCase();
    if (!isEmail(value)) {
      toast.error("Enter a valid email address");
      return;
    }
    if (emails.some((e) => e.toLowerCase() === value)) {
      toast.error("That email is already an authorizer");
      return;
    }
    setEmails((prev) => [...prev, value]);
    setEmailDraft("");
    toast.success(`${value} can now approve credit transactions`);
  };

  const save = async () => {
    if (!selected) return;
    if (!form.name.trim()) {
      toast.error("Enter a store name");
      return;
    }
    if (!form.address.name.trim()) {
      toast.error("Enter a store address");
      return;
    }

    setSaving(true);
    try {
      // Details and preferences live behind two different endpoints.
      const detail: any = await updateStore.mutateAsync({
        storeId,
        payload: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address,
        } as any,
      });
      if (detail?.statusCode !== 200) {
        toast.error(detail?.error || "Could not save store details");
        return;
      }

      const settings: any = await updateSettings.mutateAsync({
        storeId,
        payload: {
          ...flags,
          credit_sale_auth_required: emails.length > 0,
          credit_sale_auth_emails: emails,
        },
      });
      if (settings?.statusCode !== 200) {
        toast.error(settings?.error || "Could not save store settings");
        return;
      }

      toast.success(`${form.name.trim()} settings saved`);
    } catch (error: any) {
      toast.error(error?.message || "Could not save store settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (storeId && loadingDetail)) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader size={28} color="#0A6DC0" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="bg-white border border-dashed border-[#D8D8D8E6] rounded-[18px] px-6 py-14 text-center max-w-[760px]">
        <div className="font-bold text-[15px] text-[#2F2F2F]">
          No stores yet
        </div>
        <div className="text-[13px] text-[#8E8E93] mt-1">
          Create a store before setting how it runs.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px] max-w-[760px]">
      {/* ── Store picker ─────────────────────────────────────────────────── */}
      <div className="flex gap-2.5 flex-wrap">
        {stores.map((store) => {
          const active = String(store.id) === storeId;
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => setStoreId(String(store.id))}
              className={`inline-flex items-center gap-2 h-11 px-5 rounded-[12px] cursor-pointer text-[14.5px] whitespace-nowrap ${
                active
                  ? "border-none bg-[#0A6DC0] text-white font-bold"
                  : "border border-[#D8D8D8E6] bg-white text-[#2F2F2F] font-semibold hover:border-[#0A6DC0] hover:text-[#0A6DC0]"
              }`}
            >
              {active && (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
              )}
              <span>{store.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <div>
        <div className={EYEBROW}>Details</div>
        <div className="bg-white border border-[#E4E4E4] rounded-[18px] p-5 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[13.5px] text-[#6E7480]">Store name</span>
            <input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13.5px] text-[#6E7480]">Address</span>
            <input
              value={form.address.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  address: { ...prev.address, name: e.target.value },
                }))
              }
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[13.5px] text-[#6E7480]">Phone number</span>
            <input
              value={form.phone}
              inputMode="tel"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={FIELD}
            />
          </label>
        </div>
      </div>

      {/* ── Preferences ──────────────────────────────────────────────────── */}
      <div>
        <div className={EYEBROW}>Preferences</div>
        <div className="bg-white border border-[#E4E4E4] rounded-[18px] overflow-hidden">
          {FLAGS.map((flag) => (
            <div
              key={flag.key}
              className="flex items-center gap-4 px-5 py-4 border-b border-b-[#D8D8D873] last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[15.5px] font-bold tracking-[-.2px] text-[#2F2F2F]">
                  {flag.label}
                </div>
                <div className="text-[13px] text-[#8E8E93] mt-[3px]">
                  {flag.sub}
                </div>
              </div>
              <Toggle
                size="md"
                on={flags[flag.key]}
                label={flag.label}
                onChange={(next) =>
                  setFlags((prev) => ({ ...prev, [flag.key]: next }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Credit authorizers ───────────────────────────────────────────── */}
      {/* Authorizers only mean anything once credit sales are on. */}
      {flags.allow_credit_sales && (
      <div>
        <div className={EYEBROW}>Authorizer email</div>
        <div className="bg-white border border-[#E4E4E4] rounded-[18px] p-5 flex flex-col gap-3.5">
          <div className="text-[14px] text-[#6E7480]">
            Receive alerts and approve credit transactions
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <input
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                addEmail();
              }}
              placeholder="email@example.com"
              type="email"
              className={`${FIELD} flex-[1_1_240px] min-w-0`}
            />
            <button
              type="button"
              onClick={addEmail}
              className="h-[52px] px-[26px] rounded-[12px] border-none bg-[#0A6DC0] text-white cursor-pointer text-[15px] font-bold shrink-0 hover:bg-[#09599A]"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            {emails.length === 0 ? (
              <span className="text-[13px] text-[#8E8E93]">
                No authorizer added yet.
              </span>
            ) : (
              emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-[9px] h-[38px] pl-3 pr-2 rounded-[10px] border border-[#D8D8D8CC] bg-white"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6E7480" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3.5 7 8.5 6 8.5-6" />
                  </svg>
                  <span className="text-[14px] text-[#2F2F2F]">{email}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${email}`}
                    onClick={() =>
                      setEmails((prev) => prev.filter((e) => e !== email))
                    }
                    className="w-6 h-6 rounded-full border-none bg-[#F4F5F7] cursor-pointer inline-flex items-center justify-center hover:bg-[#FDECEC]"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6E7480" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 6 18 18" />
                      <path d="M18 6 6 18" />
                    </svg>
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full h-14 rounded-[14px] border-none bg-[#0A6DC0] text-white cursor-pointer text-[16px] font-bold inline-flex items-center justify-center gap-2.5 hover:bg-[#09599A] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <ClipLoader size={18} color="#fff" />
        ) : (
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        )}
        <span>Save Changes</span>
      </button>
    </div>
  );
};

export default StoreSettings;
