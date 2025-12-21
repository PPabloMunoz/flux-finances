import { Dollar02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@flux/ui/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@flux/ui/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { cn } from '@flux/ui/lib/utils'
import { authClient } from '@flux/auth/client'
import GoogleIcon from '@/components/shared/google'
import GithubIcon from '@/components/shared/github'

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
      setIsLoading(true)
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      })
      setIsLoading(false)

      if (error) {
        toast.error(error.message)
      } else {
        navigate({ to: '/app' })
      }
    },
  })

  async function handleGoogleLogin() {
    await authClient.signIn.social({ provider: 'google' })
  }

  async function handleGithubLogin() {
    await authClient.signIn.social({ provider: 'github' })
  }

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
              <CardTitle className='text-xl'>Welcome back</CardTitle>
              <CardDescription>Login with your Apple or Google account</CardDescription>
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
                    <Button onClick={handleGithubLogin} type='button' variant='outline'>
                      <GithubIcon className='size-3.5' />
                      Login with Github
                    </Button>
                    <Button onClick={handleGoogleLogin} type='button' variant='outline'>
                      <GoogleIcon className='size-3.5' />
                      Login with Google
                    </Button>
                  </Field>
                  <FieldSeparator className='*:data-[slot=field-separator-content]:bg-card'>Or continue with</FieldSeparator>
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
                          <div className='flex items-center'>
                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                            <Link className='ml-auto text-xs underline-offset-4 hover:underline' to='/auth/forgot-password'>
                              Forgot your password?
                            </Link>
                          </div>
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
                      Don&apos;t have an account? <Link to='/auth/signup'>Sign up</Link>
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
