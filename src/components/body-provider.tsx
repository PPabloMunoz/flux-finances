import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

export default function BodyProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return <body className={cn(resolvedTheme)}>{children}</body>
}
