import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name];
  if (!LucideIcon) return <span style={{ width: props.size ?? 20, height: props.size ?? 20, display: 'inline-block' }} />;
  return <LucideIcon {...props} />;
}
