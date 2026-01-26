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
import { SignupSchema } from '@/features/auth'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validators: {
      onSubmit: SignupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: `${value.firstName} ${value.lastName}`,
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
            toast.success('Account created successfully')
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
              <CardTitle className='text-xl'>Welcome</CardTitle>
              <CardDescription>Sign up with your data</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit(e)
                }}
              >
                <FieldGroup>
                  <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <form.Field name='firstName'>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                              First Name
                            </FieldLabel>
                            <Input
                              disabled={isLoading}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder='John'
                              required
                              type='text'
                              value={field.state.value}
                            />
                            {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                          </Field>
                        )
                      }}
                    </form.Field>
                    <form.Field name='lastName'>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                              Last Name
                            </FieldLabel>
                            <Input
                              disabled={isLoading}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder='Doe'
                              required
                              type='text'
                              value={field.state.value}
                            />
                            {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                          </Field>
                        )
                      }}
                    </form.Field>
                  </FieldGroup>
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
                          <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                            Password
                          </FieldLabel>
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
                      Sign up
                    </Button>
                    <FieldDescription className='text-center text-muted-foreground'>
                      Already have an account?{' '}
                      <Link
                        className='text-primary transition-colors hover:underline'
                        disabled={isLoading}
                        to='/auth/login'
                      >
                        Login
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
