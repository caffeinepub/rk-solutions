interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'h-8' }: LogoProps) {
  return (
    <img
      src="/assets/generated/rk-logo-transparent.dim_1200x400.png"
      alt="RK Solutions"
      className={className}
    />
  );
}
