import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'

export default function BodyProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  return <body className={cn(resolvedTheme)}>{children}</body>
}
