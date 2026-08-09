import type React from "react";
import { getCategoryStyle } from "../../utils/categoryStyle";

interface CategoryBadgeProps {
  category: string | null | undefined;
  label?: string;
  size?: number;
  showIcon?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  label,
  size = 12,
  showIcon = true,
}) => {
  const { icon: Icon, color } = getCategoryStyle(category);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: "0.75rem",
        fontWeight: 600,
        background: `${color}26`,
        color,
        whiteSpace: "nowrap",
      }}
    >
      {showIcon && <Icon size={size} />}
      {label ?? category}
    </span>
  );
};

export const CategoryIcon: React.FC<{
  category: string | null | undefined;
  size?: number;
}> = ({ category, size = 16 }) => {
  const { icon: Icon, color } = getCategoryStyle(category);
  return <Icon size={size} color={color} />;
};

export default CategoryBadge;
