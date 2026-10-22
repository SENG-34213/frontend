import React, { useEffect, useState } from "react";
import { apiBlob } from "../api/client";

export const TeacherAvatar: React.FC<{
  name: string;
  avatarUrl?: string;
  className?: string;
  initialsClassName?: string;
}> = ({ name, avatarUrl, className = "w-8 h-8", initialsClassName = "text-xs" }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!avatarUrl) { setSrc(null); return; }
    if (avatarUrl.startsWith("http") || avatarUrl.startsWith("data:")) { setSrc(avatarUrl); return; }
    let active = true;
    let objectUrl: string | undefined;
    void apiBlob(`/api/v1/profile-images?key=${encodeURIComponent(avatarUrl)}`)
      .then((blob) => { if (active) { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); } })
      .catch(() => { if (active) setSrc(null); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [avatarUrl]);
  const initials = name.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return src
    ? <img src={src} alt={name} className={`${className} rounded-full object-cover shrink-0`} />
    : <div className={`${className} rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold shrink-0 ${initialsClassName}`}>{initials}</div>;
};
