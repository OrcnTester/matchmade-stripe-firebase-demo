// src/components/ui/button.tsx
type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = "primary",
  className,
  ...rest
}: Props) {
  const base = "rounded px-4 py-2 text-sm font-medium";
  const map: Record<Variant, string> = {
    primary: "bg-black text-white hover:opacity-90",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "bg-transparent hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700", // <- eklendi
  };
  return (
    <button
      className={`${base} ${map[variant]} ${className ?? ""}`}
      {...rest}
    />
  );
}
