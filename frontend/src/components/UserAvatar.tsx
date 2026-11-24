import { useAuth } from "../auth/AuthContext";
import { useProfile } from "../profile/ProfileContext";

export function UserAvatar({ size = 38 }: { size?: number }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const initial = (profile.displayName || user?.email || "?").charAt(0).toUpperCase();
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };

  if (profile.avatar) {
    return <img className="avatar avatar-img" src={profile.avatar} alt="" style={style} />;
  }
  return <span className="avatar" style={style}>{initial}</span>;
}
