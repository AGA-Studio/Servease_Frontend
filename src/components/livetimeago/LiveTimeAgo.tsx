import type { CSSProperties } from "react";
import { useTimeAgo } from "../../hooks/useTimeAgo";

interface LiveTimeAgoProps {
  date: string;
  className?: string;
  style?: CSSProperties;
}

/** Renders a relative "Xm/Xh/Xd" label that keeps updating on its own. */
export const LiveTimeAgo = ({ date, className, style }: LiveTimeAgoProps) => {
  const label = useTimeAgo(date);
  return (
    <div className={className} style={style}>
      {label}
    </div>
  );
};

export default LiveTimeAgo;
