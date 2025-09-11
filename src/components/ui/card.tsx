import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
