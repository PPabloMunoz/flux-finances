import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import BodyProvider from '@/components/body-provider'
import { Toaster } from '@/components/ui/sonner'
import QuickActionsModal from '@/features/general/quick-actions-modal'
import { ThemeProvider } from '@/lib/theme-provider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Flux Finances — Personal Finance for the Modern Era' },
      {
        description:
          'A private, lightning-fast personal finance platform built with TanStack Start. Inspired by Maybe, Flux provides a type-safe and self-hostable way to manage your entire financial life.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  errorComponent: ({ error }) => (
    <div className='p-10'>
      <h1>Root Error Template</h1>
      <pre>{String(error)}</pre>
    </div>
  ),
  notFoundComponent: () => (
    <div className='p-10'>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  ),
})

const queryClient = new QueryClient()

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <html lang='en'>
          <head>
            <HeadContent />
          </head>
          <NuqsAdapter>
            <BodyProvider>
              <div className='pointer-events-none absolute top-0 left-0 h-96 w-full -translate-y-1/2 rounded-full bg-teal-900/5 blur-3xl' />
              {children}
              <QuickActionsModal />
              <Toaster />
              <Scripts />
            </BodyProvider>
          </NuqsAdapter>
        </html>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
