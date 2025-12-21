import { authClient } from '@flux/auth/client'
import { Button } from '@flux/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flux/ui/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { cn } from '@flux/ui/lib/utils'
import { Dollar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import GithubIcon from '@/components/shared/github'
import GoogleIcon from '@/components/shared/google'
import { SignupSchema } from '@/features/auth/schema'

export const Route = createFileRoute('/auth/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      const res = await authClient.signUp.email({
        name: `${value.firstName} ${value.lastName}`,
        email: value.email,
        password: value.password,
      })
      setIsLoading(false)
      console.log('Form submitted Response:', res)
    },
  })

  async function handleGoogleSignUp() {
    await authClient.signIn.social({ provider: 'google' })
  }

  async function handleGithubSignUp() {
    await authClient.signIn.social({ provider: 'github' })
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link className='flex items-center gap-2 self-center font-medium' to='/'>
          <div className='flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <HugeiconsIcon className='size-4' icon={Dollar02Icon} />
          </div>
          Flux Finances
        </Link>
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>Welcome</CardTitle>
              <CardDescription>Sign up with your Apple or Google account</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit(e)
                }}
              >
                <FieldGroup>
                  <Field>
                    <Button onClick={handleGithubSignUp} type='button' variant='outline'>
                      <GithubIcon className='size-3.5' />
                      Sign up with Github
                    </Button>
                    <Button onClick={handleGoogleSignUp} type='button' variant='outline'>
                      <GoogleIcon className='size-3.5' />
                      Sign up with Google
                    </Button>
                  </Field>

                  <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>Or continue with</FieldSeparator>

                  <FieldGroup className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <form.Field name='firstName'>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
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
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        )
                      }}
                    </form.Field>
                    <form.Field name='lastName'>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                        return (
                          <Field>
                            <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
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
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <form.Field name='password'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            type='password'
                            value={field.state.value}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>
                  <form.Field name='confirmPassword'>
                    {(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                          <Input
                            disabled={isLoading}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            required
                            type='password'
                            value={field.state.value}
                          />
                          {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </Field>
                      )
                    }}
                  </form.Field>

                  <Field>
                    <Button type='submit'>Login</Button>
                    <FieldDescription className='text-center'>
                      Already have an account? <Link to='/auth/login'>Login</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
          <FieldDescription className='px-6 text-center'>
            By clicking continue, you agree to our <a href='/#'>Terms of Service</a> and <a href='/#'>Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
