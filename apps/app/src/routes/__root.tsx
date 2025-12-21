import { Toaster } from '@flux/ui/components/ui/sonner'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
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
    <div>
      <h1>Root Error Boundary</h1>
      <pre>{String(error)}</pre>
    </div>
  ),
  notFoundComponent: () => (
    <div>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className='dark' lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}

        <Toaster theme='dark' />
        <Scripts />
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
      </body>
    </html>
  )
}
