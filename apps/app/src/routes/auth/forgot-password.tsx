import { Dollar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@flux/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flux/ui/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { cn } from '@flux/ui/lib/utils'
import { authClient } from '@flux/auth/client'
import { ForgotPasswordSchema } from '@/features/auth/schema'

export const Route = createFileRoute('/auth/forgot-password')({
  component: RouteComponent,
})

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL
if (!PUBLIC_URL) throw new Error('VITE_PUBLIC_URL is not defined')

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: '',
    },
    validators: {
      onChange: ForgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const redirectTo = `${PUBLIC_URL}/auth/reset-password`
      setIsLoading(true)
      const { error } = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo,
      })
      setIsLoading(false)

      if (error) {
        toast.error('Intentalo de nuevo')
      } else {
        toast.success('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.')
        navigate({ to: '/auth/login' })
      }
    },
  })

  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link className='flex items-center gap-2 self-center font-medium' to='/'>
          <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
            <HugeiconsIcon className='size-4' icon={Dollar02Icon} />
          </div>
          Flux Finances
        </Link>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>Forgot your password?</CardTitle>
              <CardDescription>Enter your email address and we&apos;ll send you a link to reset your password.</CardDescription>
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
                          <FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <Field>
                    <Button type='submit'>{isLoading ? 'Sending...' : 'Send reset link'}</Button>
                    <FieldDescription className='text-center'>
                      Want to login instead? <Link to='/auth/login'>Click here</Link>.
                    </FieldDescription>
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
