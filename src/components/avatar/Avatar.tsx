import { useState } from "react";

const PALETTE = [
  "#2EBCCC",
  "#1B244C",
  "#4AA825",
  "#FFB200",
  "#E85D75",
  "#8B5CF6",
  "#FF7A45",
  "#0EA5A0",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name?: string, lastName?: string): string {
  if (name && lastName) {
    return `${name[0]}${lastName[0]}`.toUpperCase();
  }
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

interface AvatarProps {
  photoUrl?: string | null;
  name?: string;
  lastName?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  photoUrl,
  name,
  lastName,
  size = 40,
  className,
  style,
  alt,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = getInitials(name, lastName);
  const seed = `${name ?? ""}${lastName ?? ""}` || "?";
  const bgColor = PALETTE[hashString(seed) % PALETTE.length];

  if (photoUrl && !imgFailed) {
    return (
      <img
        src={photoUrl}
        alt={alt ?? name ?? "Avatar"}
        onError={() => setImgFailed(true)}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bgColor,
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.4,
        userSelect: "none",
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
