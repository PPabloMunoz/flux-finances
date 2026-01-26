import { Dollar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onError: ({ error }) => {
            toast.error(error.message)
          },
          onSuccess: () => {
            toast.success('Successfully logged in')
            navigate({ to: '/' })
          },
        }
      )
    },
  })

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-foreground md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          className='flex items-center gap-2 self-center font-medium transition-colors hover:text-primary'
          disabled={isLoading}
          to='/'
        >
          <div className='flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <HugeiconsIcon className='size-4' icon={Dollar02Icon} />
          </div>
          Flux Finances
        </Link>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>Welcome back</CardTitle>
              <CardDescription>Login with your email and password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit(e)
                }}
              >
                <FieldGroup>
                  <form.Field name='email'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                            Email
                          </FieldLabel>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder='m@example.com'
                            required
                            type='email'
                            value={field.state.value}
                          />
                          {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <form.Field name='password'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <div className='flex items-center'>
                            <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                              Password
                            </FieldLabel>
                            <Link
                              className='ml-auto text-muted-foreground text-xs underline-offset-4 transition-colors hover:text-primary hover:underline'
                              tabIndex={-1}
                              to='/auth/forgot-password'
                            >
                              Forgot your password?
                            </Link>
                          </div>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder='••••••••'
                            required
                            type='password'
                            value={field.state.value}
                          />
                          {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <Field>
                    <Button disabled={isLoading} type='submit'>
                      Login
                    </Button>
                    <FieldDescription className='text-center text-muted-foreground'>
                      Don&apos;t have an account?{' '}
                      <Link
                        className='text-primary transition-colors hover:underline'
                        disabled={isLoading}
                        to='/auth/signup'
                      >
                        Sign up
                      </Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className='px-6 text-center text-muted-foreground/60'>
            By clicking continue, you agree to our{' '}
            <a className='underline underline-offset-4 hover:text-primary' href='/#'>
              Terms of Service
            </a>{' '}
            and{' '}
            <a className='underline underline-offset-4 hover:text-primary' href='/#'>
              Privacy Policy
            </a>
            .
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
