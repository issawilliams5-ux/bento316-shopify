interface BadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "green" | "yellow" | "orange" | "red" | "slate";
  size?: "sm" | "md";
}

const variantClasses = {
  cyan: "bg-cyan-900/50 text-cyan-300 border-cyan-700",
  green: "bg-green-900/50 text-green-300 border-green-700",
  yellow: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  orange: "bg-orange-900/50 text-orange-300 border-orange-700",
  red: "bg-red-900/50 text-red-300 border-red-700",
  slate: "bg-slate-700/50 text-slate-300 border-slate-600",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export default function Badge({
  children,
  variant = "slate",
  size = "sm",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  let variant: BadgeProps["variant"] = "red";
  if (score >= 80) variant = "green";
  else if (score >= 60) variant = "yellow";
  else if (score >= 40) variant = "orange";

  return (
    <Badge variant={variant} size="md">
      {score}/100
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps["variant"]> = {
    new: "cyan",
    contacted: "yellow",
    qualified: "green",
    booked: "green",
    lost: "red",
  };
  return (
    <Badge variant={map[status] ?? "slate"} size="sm">
      {status}
    </Badge>
  );
}
