import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import ErrorPage from '@/components/error-page'
import NotFoundPage from '@/components/not-found-page'
import { Toaster } from '@/components/ui/sonner'
import QuickActionsModal from '@/features/general/quick-actions-modal'
import { ThemeProvider, ThemeScript } from '@/lib/theme-provider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // { title: 'Flux Finances — Personal Finance for the Modern Era' },
      { title: 'Flux Finances' },
      {
        description:
          'A private, lightning-fast personal finance platform built with TanStack Start. Inspired by Maybe, Flux provides a type-safe and self-hostable way to manage your entire financial life.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: ErrorPage,
  notFoundComponent: NotFoundPage,
})

const queryClient = new QueryClient()

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang='en' suppressHydrationWarning>
        <head>
          <ThemeScript />
          <HeadContent />
        </head>
        <body>
          <ThemeProvider>
            <NuqsAdapter>
              <div className='pointer-events-none absolute top-0 left-0 z-45 h-96 w-full -translate-y-1/2 rounded-full bg-teal-900/5 blur-3xl' />
              {children}
              <QuickActionsModal />
              <Toaster />
              <Scripts />
            </NuqsAdapter>
          </ThemeProvider>
        </body>
      </html>
    </QueryClientProvider>
  )
}
