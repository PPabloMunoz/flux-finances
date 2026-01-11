import { ArrowLeft02Icon, Shield02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/client'

const TotpVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

const BackupCodeVerifySchema = z.object({
  code: z.string().min(1, 'Backup code is required'),
})

export const Route = createFileRoute('/auth/two-factor')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'totp' | 'backup'>('totp')
  const navigate = useNavigate()

  const totpForm = useForm({
    defaultValues: {
      code: '',
    },
    validators: { onChange: TotpVerifySchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp(
        { code: value.code },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onError: () => {
            toast.error('Invalid authentication code')
          },
          onSuccess: () => {
            toast.success('Verified successfully')
            navigate({ to: '/' })
          },
        }
      )
    },
  })

  const backupCodeForm = useForm({
    defaultValues: {
      code: '',
    },
    validators: { onChange: BackupCodeVerifySchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyBackupCode(
        { code: value.code },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onError: () => {
            toast.error('An error occurred while verifying the backup code')
          },
          onSuccess: () => {
            toast.success('Backup code verified successfully')
            navigate({ to: '/' })
          },
        }
      )
    },
  })

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Card>
          <CardHeader className='relative text-center'>
            <Link className='absolute top-3 left-4' to='/auth/login'>
              <HugeiconsIcon icon={ArrowLeft02Icon} />
            </Link>
            <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
              <HugeiconsIcon className='size-6' icon={Shield02Icon} />
            </div>
            <CardTitle className='text-xl'>Two-Factor Authentication</CardTitle>
            <CardDescription>
              {verificationMethod === 'totp'
                ? 'Enter the code from your authenticator app'
                : 'Enter one of your backup codes'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationMethod === 'totp' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  totpForm.handleSubmit(e)
                }}
              >
                <div className='flex flex-col gap-6'>
                  <totpForm.Field name='code'>
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
                  </totpForm.Field>

                  <Button disabled={isLoading} type='submit'>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>

                  <Button
                    className='text-muted-foreground'
                    disabled={isLoading}
                    onClick={() => setVerificationMethod('backup')}
                    type='button'
                    variant='link'
                  >
                    Use a backup code instead
                  </Button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  backupCodeForm.handleSubmit(e)
                }}
              >
                <div className='flex flex-col gap-6'>
                  <backupCodeForm.Field name='code'>
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Backup Code</FieldLabel>
                        <Input
                          autoComplete='off'
                          className='text-center font-mono uppercase'
                          disabled={isLoading}
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                          placeholder='XXXXXXXX'
                          required
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </backupCodeForm.Field>

                  <Button disabled={isLoading} type='submit'>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>

                  <Button
                    className='text-muted-foreground'
                    disabled={isLoading}
                    onClick={() => setVerificationMethod('totp')}
                    type='button'
                    variant='link'
                  >
                    Use authenticator code instead
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
