import { authClient } from '@flux/auth/client'
import { Field, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { Skeleton } from '@flux/ui/components/ui/skeleton'
import { ArrowRight03Icon, Dollar02FreeIcons, Logout05Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm, useStore } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { onboardingAuthStateFn } from '@/features/auth/queries'

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const Route = createFileRoute('/onboarding/')({
  component: RouteComponent,
  beforeLoad: async () => await onboardingAuthStateFn(),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: organizations } = authClient.useListOrganizations()
  const session = authClient.useSession()

  if (organizations && organizations.length > 0) {
    authClient.organization.setActive({ organizationId: organizations[0].id })
    navigate({ to: '/' })
  }

  const form = useForm({
    defaultValues: {
      name: '',
      slug: '',
    },
    onSubmit: async ({ value }) => {
      authClient.organization.create({
        name: value.name,
        slug: value.slug || generateSlug(value.name),
      })
    },
  })

  const name = useStore(form.store, (state) => state.values.name)

  useEffect(() => {
    form.setFieldValue('slug', generateSlug(name))
  }, [name, form.setFieldValue])

  return (
    <>
      <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-neutral-950 px-4 py-12'>
        <main className='relative z-10 w-full max-w-md px-6 py-12'>
          <div className='mb-8 flex animate-fade-in flex-col items-center text-center'>
            <div className='mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]'>
              <HugeiconsIcon className='size-5' icon={Dollar02FreeIcons} />
            </div>
            <h1 className='mb-2 font-semibold text-2xl text-white tracking-tight'>
              Welcome to Flux Finances
            </h1>
            <p className='max-w-xs text-neutral-500 text-sm'>
              The modern way to track your net worth. Let's get your household set up.
            </p>
          </div>

          <form
            className='glass-panel animate-fade-in rounded-2xl p-1 delay-100'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit(e)
            }}
          >
            <div className='space-y-5 px-5 pt-2 pb-6'>
              <form.Field name='name'>
                {(field) => {
                  return (
                    <Field className='space-y-1.5'>
                      <FieldLabel
                        className='ml-1 font-semibold text-[10px] text-neutral-500 uppercase tracking-wider'
                        htmlFor={field.name}
                      >
                        Household Name
                      </FieldLabel>
                      <Input
                        className='w-full border-none bg-transparent text-sm text-white placeholder-neutral-600 outline-none'
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. The Smith Family'
                        type='text'
                        value={field.state.value}
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='slug'>
                {(field) => {
                  return (
                    <Field>
                      <FieldLabel
                        className='ml-1 font-semibold text-[10px] text-neutral-500 uppercase tracking-wider'
                        htmlFor={field.name}
                      >
                        Household URL Slug
                      </FieldLabel>
                      <Input
                        className='w-full border-none bg-transparent text-sm text-white placeholder-neutral-600 outline-none'
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. smith-family'
                        type='text'
                        value={field.state.value}
                      />
                    </Field>
                  )
                }}
              </form.Field>

              <div className='my-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent' />

              {/*<!-- Action Button -->*/}
              <button
                className='group flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 font-medium text-black text-sm shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors hover:bg-neutral-200'
                type='submit'
              >
                Create Household
                <HugeiconsIcon className='size-4' icon={ArrowRight03Icon} />
              </button>
            </div>
          </form>
          <div className='mt-6 animate-fade-in text-center delay-100'>
            <p className='mb-3 text-neutral-500 text-xs'>Have an invite code?</p>
            <div className='relative mx-auto w-full max-w-[280px]'>
              <input
                className='w-full rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-center text-white text-xs placeholder-neutral-600 outline-none transition-all focus:border-teal-500/50 focus:bg-neutral-900'
                placeholder='Paste code here...'
                type='text'
              />
              <button
                className='absolute top-1 right-1 bottom-1 flex h-auto w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-400 transition-colors hover:bg-teal-500 hover:text-white'
                type='button'
              >
                <span className='iconify' data-icon='lucide:arrow-right' data-width='12' />
              </button>
            </div>
          </div>
          <div className='mt-12 flex items-center justify-center gap-6 text-neutral-600 text-xs'>
            <span className='transition-colors hover:text-neutral-400'>Terms</span>
            <span className='transition-colors hover:text-neutral-400'>Privacy</span>
            <span className='transition-colors hover:text-neutral-400'>Help Center</span>
          </div>
        </main>
      </div>

      {!session.data?.user ? (
        <button
          className='absolute top-6 right-0 left-0 mx-auto flex max-w-fit items-center gap-3 rounded-full transition-colors'
          type='button'
        >
          <Skeleton className='h-9 w-40 rounded-full bg-neutral-800' />
        </button>
      ) : (
        <button
          className='group absolute top-6 right-0 left-0 mx-auto flex max-w-fit items-center gap-3 rounded-full bg-neutral-900/50 px-3 py-2 transition-colors hover:bg-neutral-800/50'
          onClick={() => {
            authClient.signOut()
            navigate({ to: '/auth/login' })
          }}
          type='button'
        >
          <div className='flex h-6 w-6 items-center justify-center rounded-full border border-neutral-700 bg-gradient-to-br from-neutral-700 to-neutral-800 font-medium text-[10px] text-white'>
            {session.data.user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-[10px] text-white leading-none'>
              {session.data.user.name}
            </span>
            <span className='mt-0.5 text-[10px] text-neutral-500 leading-none'>
              {session.data.user.email}
            </span>
          </div>
          <span className='ml-2 text-neutral-500 transition-colors group-hover:text-red-500'>
            <HugeiconsIcon className='size-3' icon={Logout05Icon} />
          </span>
        </button>
      )}
    </>
  )
}
