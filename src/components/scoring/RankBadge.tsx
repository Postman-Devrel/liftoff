"use client";

import { BASE_PATH } from "@/lib/base-path";

interface RankBadgeProps {
  badgeImg: string;
  badgeImgFull: string;
  title: string;
  size?: number;
  variant?: "icon" | "full";
}

export default function RankBadge({ badgeImg, badgeImgFull, title, size = 48, variant = "full" }: RankBadgeProps) {
  const src = `${BASE_PATH}${variant === "full" ? badgeImgFull : badgeImg}`;

  return (
    <img
      src={src}
      alt={title}
      width={size}
      height={size}
      className="inline-block rounded-2xl"
      style={{ width: size, height: "auto" }}
    />
  );
}
