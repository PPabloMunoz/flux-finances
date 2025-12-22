import { createFileRoute } from '@tanstack/react-router'
import AppHeader from '@/components/header'

export const Route = createFileRoute('/investments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <AppHeader />

      <main className='container mx-auto px-5 py-10'>
        <h1 className='mb-5 font-bold text-3xl'>Investments</h1>
      </main>
    </>
  )
}
