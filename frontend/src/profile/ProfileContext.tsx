import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type Profile = {
  displayName: string;
  username: string;
  jobTitle: string;
  organization: string;
  avatar: string | null;
};

const EMPTY: Profile = { displayName: "", username: "", jobTitle: "", organization: "", avatar: null };
const STORAGE_KEY = "sanad_profile";

type ProfileValue = { profile: Profile; save: (next: Profile) => void };
const ProfileContext = createContext<ProfileValue | null>(null);

function readProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Profile>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(readProfile);

  const save = useCallback((next: Profile) => {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // الصورة كبيرة أو المساحة خلصت: الحفظ هيفضل في الذاكرة لحد ما الصفحة تتقفل
    }
  }, []);

  const value = useMemo(() => ({ profile, save }), [profile, save]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile لازم يتستخدم جوا ProfileProvider");
  return ctx;
}
