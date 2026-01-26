import { Dollar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ResetPasswordSchema } from '@/features/auth'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/auth/reset-password')({
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string().min(1),
  }),
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const { token } = Route.useSearch()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    validators: { onChange: ResetPasswordSchema },
    onSubmit: async ({ value }) => {
      await authClient.resetPassword(
        { newPassword: value.password, token },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onError: ({ error }) => {
            toast.error(error.message)
          },
          onSuccess: () => {
            toast.success('Password changed successfully')
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
              <CardTitle className='text-xl'>Reset your password</CardTitle>
              <CardDescription>
                Enter your new password below to reset your account password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit(e)
                }}
              >
                <FieldGroup>
                  <form.Field name='password'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                            Password
                          </FieldLabel>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            type='password'
                            value={field.state.value}
                          />
                          {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <form.Field name='confirmPassword'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                            Confirm Password
                          </FieldLabel>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
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
                      {isLoading ? 'Loading...' : 'Reset Password'}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
