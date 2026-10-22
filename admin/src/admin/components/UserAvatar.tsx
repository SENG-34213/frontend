import React, { useEffect, useState } from "react";
import { apiBlob } from "../api/client";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, size = "md", className = "" }) => {
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedAvatar(null);
      return;
    }
    if (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResolvedAvatar(avatarUrl); return;
    }
    let active = true;
    let objectUrl: string | undefined;
    void apiBlob(`/api/v1/profile-images?key=${encodeURIComponent(avatarUrl)}`)
      .then((blob) => { if (active) { objectUrl = URL.createObjectURL(blob); setResolvedAvatar(objectUrl); } })
      .catch(() => { if (active) setResolvedAvatar(null); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [avatarUrl]);
  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getGradient = (n: string) => {
    const charCode = n.charCodeAt(0) + (n.charCodeAt(1) || 0);
    const variants = [
      "from-indigo-500 to-purple-600 text-white",
      "from-blue-500 to-indigo-600 text-white",
      "from-violet-500 to-purple-700 text-white",
      "from-teal-500 to-emerald-600 text-white",
      "from-sky-500 to-blue-600 text-white",
    ];
    return variants[charCode % variants.length];
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-11 h-11 text-sm font-semibold",
    xl: "w-16 h-16 text-lg font-bold",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br font-medium shrink-0 select-none shadow-xs ${sizeClasses[size]} ${getGradient(name)} ${className}`}
      aria-label={name}
    >
      {resolvedAvatar ? <img src={resolvedAvatar} alt={name} className="w-full h-full rounded-full object-cover" /> : <span>{getInitials(name)}</span>}
    </div>
  );
};
