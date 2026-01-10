import { Shield02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/client'

const TwoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

export const Route = createFileRoute('/auth/two-factor')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      code: '',
    },
    validators: { onChange: TwoFactorVerifySchema },
    onSubmit: async ({ value }) => {
      setIsLoading(true)
      const { error } = await authClient.twoFactor.verifyTotp({
        code: value.code,
        trustDevice: false,
      })
      setIsLoading(false)

      if (error) {
        toast.error(`Invalid code: ${error.message}`)
        return
      }

      toast.success('Verified successfully')
      navigate({ to: '/' })
    },
  })

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Card>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <HugeiconsIcon className='size-6' icon={Shield02Icon} />
            </div>
            <CardTitle className='text-xl'>Two-Factor Authentication</CardTitle>
            <CardDescription>Enter the code from your authenticator app</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(e)
              }}
            >
              <div className='flex flex-col gap-6'>
                <form.Field name='code'>
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Authentication Code</FieldLabel>
                      <Input
                        autoComplete='one-time-code'
                        className='text-center'
                        disabled={isLoading}
                        id={field.name}
                        inputMode='numeric'
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='000000'
                        required
                        value={field.state.value}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )}
                </form.Field>

                <Button disabled={isLoading} type='submit'>
                  {isLoading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
