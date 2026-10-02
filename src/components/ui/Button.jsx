import Link from "next/link";

const variantClasses = {
  primary:
    "bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 hover:shadow-lg hover:scale-[1.02]",
  secondary:
    "border border-neutral-300 bg-background text-foreground hover:border-black dark:hover:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black",
  outline:
    "border border-border-color bg-background text-foreground hover:border-black dark:hover:border-white hover:text-foreground",
  ghost:
    "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
  soft:
    "border border-white/10 dark:border-black/10 bg-background/10 text-white dark:text-black hover:bg-background/15",
  icon:
    "border border-border-color bg-background text-foreground hover:border-black dark:hover:border-white hover:bg-muted",
};

const sizeClasses = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-8 text-sm",
  icon: "h-11 w-11 p-0",
};

export default function Button({
  href,
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  target,
  rel,
  ...props
}) {
  const classes = [
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-all duration-300",
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} target={target} rel={rel} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} target={target} rel={rel} {...props}>
      {children}
    </button>
  );
}