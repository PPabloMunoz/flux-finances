import { Alert02Icon, Shield01Icon, Shield02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  ChangePasswordSchema,
  TwoFactorDisableSchema,
  TwoFactorEnableSchema,
  TwoFactorGenerateBackupCodesSchema,
  TwoFactorVerifySchema,
} from '@/features/auth/schema'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const PersonalInfoValidator = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
})

export default function ProfileSettings() {
  const { data: currentSession, error } = authClient.useSession()
  const [isLoading, setIsLoading] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [isEnableTwoFactorDialogOpen, setIsEnableTwoFactorDialogOpen] = useState(false)
  const [isEnablingTwoFactor, setIsEnablingTwoFactor] = useState(false)
  const [twoFactorStep, setTwoFactorStep] = useState<'password' | 'setup' | 'success'>('password')
  const [twoFactorShowSecret, setTwoFactorShowSecret] = useState(false)
  const [totpUri, setTotpUri] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const [isDisableTwoFactorDialogOpen, setIsDisableTwoFactorDialogOpen] = useState(false)
  const [isDisablingTwoFactor, setIsDisablingTwoFactor] = useState(false)

  const [isBackupCodesDialogOpen, setIsBackupCodesDialogOpen] = useState(false)
  const [isGeneratingBackupCodes, setIsGeneratingBackupCodes] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([])

  const personalInfoForm = useForm({
    defaultValues: {
      fullName: error ? 'Error loading name' : currentSession?.user.name || 'Loading...',
    },
    validators: { onChange: PersonalInfoValidator },
    onSubmit: async ({ value }) => {
      if (value.fullName === currentSession?.user.name) return toast.info('No changes detected')
      await authClient.updateUser(
        { name: value.fullName },
        {
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
          onError: ({ error }) => {
            toast.error(`Error updating profile: ${error.message}`)
          },
          onSuccess: () => {
            toast.success('Profile updated successfully')
          },
        }
      )
    },
  })

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validators: { onChange: ChangePasswordSchema },
    onSubmit: async ({ value }) => {
      await authClient.changePassword(
        { currentPassword: value.currentPassword, newPassword: value.newPassword },
        {
          onRequest: () => setIsChangingPassword(true),
          onResponse: () => setIsChangingPassword(false),
          onError: ({ error }) => {
            toast.error(`Error changing password: ${error.message}`)
          },
          onSuccess: () => {
            toast.success('Password changed successfully')
            setIsPasswordDialogOpen(false)
            passwordForm.reset()
          },
        }
      )
    },
  })

  const enableTwoFactorForm = useForm({
    defaultValues: { password: '' },
    validators: { onChange: TwoFactorEnableSchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.enable(
        { password: value.password },
        {
          onRequest: () => setIsEnablingTwoFactor(true),
          onResponse: () => setIsEnablingTwoFactor(false),
          onError: ({ error }) => {
            toast.error(`Error enabling 2FA: ${error.message}`)
          },
          onSuccess: ({ data }) => {
            if (data) {
              setTotpUri(data.totpURI)
              const secretMatch = data.totpURI.match(/secret=([^&]+)/)
              setTotpSecret(secretMatch ? secretMatch[1] : '')
              setBackupCodes(data.backupCodes)
              setTwoFactorStep('setup')
            }
          },
        }
      )
    },
  })

  const verifyTwoFactorForm = useForm({
    defaultValues: { code: '' },
    validators: { onChange: TwoFactorVerifySchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp(
        { code: value.code },
        {
          onRequest: () => setIsEnablingTwoFactor(true),
          onResponse: () => setIsEnablingTwoFactor(false),
          onError: ({ error }) => {
            toast.error(`Error verifying 2FA code: ${error.message}`)
          },
          onSuccess: () => {
            toast.success('Two-factor authentication enabled successfully')
            setTwoFactorStep('success')
            verifyTwoFactorForm.reset()
          },
        }
      )
    },
  })

  const disableTwoFactorForm = useForm({
    defaultValues: { password: '' },
    validators: { onChange: TwoFactorDisableSchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.disable(
        { password: value.password },
        {
          onRequest: () => setIsDisablingTwoFactor(true),
          onResponse: () => setIsDisablingTwoFactor(false),
          onError: ({ error }) => {
            toast.error(`Error disabling 2FA: ${error.message}`)
          },
          onSuccess: () => {
            toast.success('Two-factor authentication disabled')
            setIsDisableTwoFactorDialogOpen(false)
            disableTwoFactorForm.reset()
          },
        }
      )
    },
  })

  const backupCodesForm = useForm({
    defaultValues: { password: '' },
    validators: { onChange: TwoFactorGenerateBackupCodesSchema },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.generateBackupCodes(
        { password: value.password },
        {
          onRequest: () => setIsGeneratingBackupCodes(true),
          onResponse: () => setIsGeneratingBackupCodes(false),
          onError: ({ error }) => {
            toast.error(`Error generating backup codes: ${error.message}`)
          },
          onSuccess: (data) => {
            if ('backupCodes' in data) {
              setNewBackupCodes(data.backupCodes as string[])
            }
          },
        }
      )
    },
  })

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.')
      return
    }

    await authClient.deleteUser(
      { password: '' },
      {
        onRequest: () => setIsDeleting(true),
        onResponse: () => setIsDeleting(false),
        onError: ({ error }) => {
          toast.error(`Error deleting account: ${error.message}`)
        },
        onSuccess: () => {
          toast.success(
            'Account deletion initiated. This is a placeholder - full deletion requires backend implementation.'
          )
          setIsDeleteDialogOpen(false)
          setDeleteConfirmation('')
        },
      }
    )
  }

  const downloadBackupCodes = (codes: string[], filename: string) => {
    const content = codes.map((code, i) => `${i + 1}. ${code}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const closeEnableTwoFactorDialog = (open: boolean) => {
    setIsEnableTwoFactorDialogOpen(open)
    if (!open) {
      setTwoFactorStep('password')
      setTwoFactorShowSecret(false)
      setTotpUri('')
      setTotpSecret('')
      setBackupCodes([])
      enableTwoFactorForm.reset()
      verifyTwoFactorForm.reset()
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              personalInfoForm.handleSubmit(e)
            }}
          >
            <Field className='space-y-2'>
              <FieldLabel htmlFor='email'>Email Address</FieldLabel>
              <Input
                className='bg-muted'
                defaultValue={
                  error ? 'ERROR LOADING EMAIL' : currentSession?.user.email || 'Loading...'
                }
                disabled
                name='email'
                required
                type='email'
              />
              <p className='text-muted-foreground text-xs'>Email address cannot be changed</p>
            </Field>

            <personalInfoForm.Field name='fullName'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                    <Input
                      className={cn(
                        '',
                        error || (!currentSession && 'cursor-not-allowed opacity-50')
                      )}
                      disabled={!!error || !currentSession || isLoading}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={currentSession?.user.name}
                      required
                      type='text'
                      value={field.state.value}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </personalInfoForm.Field>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                disabled={personalInfoForm.state.isDirty || isLoading}
                onClick={() => personalInfoForm.reset()}
                variant='outline'
              >
                Reset
              </Button>
              <Button disabled={personalInfoForm.state.isDirty || isLoading} type='submit'>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium'>Password</h4>
              <p className='text-muted-foreground text-sm'>
                Change your password to keep your account secure
              </p>
            </div>
            <Dialog onOpenChange={setIsPasswordDialogOpen} open={isPasswordDialogOpen}>
              <DialogTrigger
                render={
                  <Button size='sm' variant='outline'>
                    Change Password
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password to update your account
                    credentials.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className='space-y-4'
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    passwordForm.handleSubmit(e)
                  }}
                >
                  <passwordForm.Field name='currentPassword'>
                    {(field) => (
                      <Field className='space-y-2'>
                        <FieldLabel htmlFor={field.name}>Current Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type='password'
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </passwordForm.Field>

                  <passwordForm.Field name='newPassword'>
                    {(field) => (
                      <Field className='space-y-2'>
                        <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type='password'
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </passwordForm.Field>

                  <passwordForm.Field name='confirmPassword'>
                    {(field) => (
                      <Field className='space-y-2'>
                        <FieldLabel htmlFor={field.name}>Confirm New Password</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          required
                          type='password'
                          value={field.state.value}
                        />
                        {field.state.meta.errors.length > 0 && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )}
                  </passwordForm.Field>

                  <DialogFooter className='pt-4'>
                    <Button
                      disabled={isChangingPassword}
                      onClick={() => setIsPasswordDialogOpen(false)}
                      type='button'
                      variant='outline'
                    >
                      Cancel
                    </Button>
                    <Button disabled={isChangingPassword} type='submit'>
                      {isChangingPassword ? 'Changing...' : 'Change Password'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='flex items-center justify-between border-t pt-6'>
            <div className='flex items-center gap-3'>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  currentSession?.user.twoFactorEnabled
                    ? 'bg-green-100 text-green-600'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <HugeiconsIcon
                  className='size-5'
                  icon={currentSession?.user.twoFactorEnabled ? Shield02Icon : Shield01Icon}
                />
              </div>
              <div>
                <h4 className='font-medium'>Two-Factor Authentication</h4>
                <p className='text-muted-foreground text-sm'>
                  {currentSession?.user.twoFactorEnabled
                    ? 'Enabled - Using authenticator app'
                    : 'Disabled - Add an extra layer of security'}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              {currentSession?.user.twoFactorEnabled ? (
                <>
                  <Dialog
                    onOpenChange={setIsDisableTwoFactorDialogOpen}
                    open={isDisableTwoFactorDialogOpen}
                  >
                    <DialogTrigger
                      render={
                        <Button size='sm' variant='outline'>
                          Disable 2FA
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                        <DialogDescription>
                          This will remove the extra security layer from your account. You will only
                          need your email and password to sign in.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        className='space-y-4'
                        onSubmit={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          disableTwoFactorForm.handleSubmit(e)
                        }}
                      >
                        <disableTwoFactorForm.Field name='password'>
                          {(field) => (
                            <Field className='space-y-2'>
                              <FieldLabel htmlFor={field.name}>Enter your password</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                                type='password'
                                value={field.state.value}
                              />
                              {field.state.meta.errors.length > 0 && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )}
                        </disableTwoFactorForm.Field>

                        <DialogFooter className='pt-4'>
                          <Button
                            disabled={isDisablingTwoFactor}
                            onClick={() => setIsDisableTwoFactorDialogOpen(false)}
                            type='button'
                            variant='outline'
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={isDisablingTwoFactor}
                            type='submit'
                            variant='destructive'
                          >
                            {isDisablingTwoFactor ? 'Disabling...' : 'Disable 2FA'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog onOpenChange={setIsBackupCodesDialogOpen} open={isBackupCodesDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button size='sm' variant='outline'>
                          Regenerate Backup Codes
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Regenerate Backup Codes</DialogTitle>
                        <DialogDescription>
                          Enter your password to generate new backup codes. Your old backup codes
                          will no longer work.
                        </DialogDescription>
                      </DialogHeader>
                      {newBackupCodes.length > 0 ? (
                        <div className='space-y-4'>
                          <div className='rounded-lg bg-muted p-4'>
                            <p className='mb-2 font-medium text-sm'>
                              Save these backup codes in a safe place
                            </p>
                            <div className='grid grid-cols-2 gap-2 text-sm'>
                              {newBackupCodes.map((code) => (
                                <code className='font-mono' key={code}>
                                  {code}
                                </code>
                              ))}
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              className='flex-1'
                              onClick={() =>
                                downloadBackupCodes(newBackupCodes, 'flux-backup-codes.txt')
                              }
                              variant='outline'
                            >
                              Download
                            </Button>
                            <Button
                              className='flex-1'
                              onClick={() => {
                                navigator.clipboard.writeText(newBackupCodes.join('\n'))
                                toast.success('Copied to clipboard')
                              }}
                              variant='outline'
                            >
                              Copy
                            </Button>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                setNewBackupCodes([])
                                backupCodesForm.reset()
                              }}
                              variant='outline'
                            >
                              Done
                            </Button>
                          </DialogFooter>
                        </div>
                      ) : (
                        <form
                          className='space-y-4'
                          onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            backupCodesForm.handleSubmit(e)
                          }}
                        >
                          <backupCodesForm.Field name='password'>
                            {(field) => (
                              <Field className='space-y-2'>
                                <FieldLabel htmlFor={field.name}>Enter your password</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  required
                                  type='password'
                                  value={field.state.value}
                                />
                                {field.state.meta.errors.length > 0 && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )}
                          </backupCodesForm.Field>

                          <DialogFooter className='pt-4'>
                            <Button
                              disabled={isGeneratingBackupCodes}
                              onClick={() => setIsBackupCodesDialogOpen(false)}
                              type='button'
                              variant='outline'
                            >
                              Cancel
                            </Button>
                            <Button disabled={isGeneratingBackupCodes} type='submit'>
                              {isGeneratingBackupCodes ? 'Generating...' : 'Generate'}
                            </Button>
                          </DialogFooter>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Dialog
                  onOpenChange={closeEnableTwoFactorDialog}
                  open={isEnableTwoFactorDialogOpen}
                >
                  <DialogTrigger
                    render={
                      <Button size='sm' variant='default'>
                        Enable 2FA
                      </Button>
                    }
                  />
                  <DialogContent className='max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                      <DialogDescription>
                        Protect your account with an authenticator app like Google Authenticator,
                        Authy, or 1Password.
                      </DialogDescription>
                    </DialogHeader>

                    {twoFactorStep === 'password' && (
                      <form
                        className='space-y-4'
                        onSubmit={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          enableTwoFactorForm.handleSubmit(e)
                        }}
                      >
                        <enableTwoFactorForm.Field name='password'>
                          {(field) => (
                            <Field className='space-y-2'>
                              <FieldLabel htmlFor={field.name}>Enter your password</FieldLabel>
                              <Input
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                required
                                type='password'
                                value={field.state.value}
                              />
                              {field.state.meta.errors.length > 0 && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          )}
                        </enableTwoFactorForm.Field>

                        <DialogFooter className='pt-4'>
                          <Button
                            disabled={isEnablingTwoFactor}
                            onClick={() => setIsEnableTwoFactorDialogOpen(false)}
                            type='button'
                            variant='outline'
                          >
                            Cancel
                          </Button>
                          <Button disabled={isEnablingTwoFactor} type='submit'>
                            {isEnablingTwoFactor ? 'Setting up...' : 'Continue'}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}

                    {twoFactorStep === 'setup' && (
                      <div className='space-y-4'>
                        <div className='flex justify-center'>
                          {twoFactorShowSecret ? (
                            <div className='space-y-2 text-center'>
                              <p className='text-muted-foreground text-sm'>
                                Copy this secret to your authenticator app
                              </p>
                              <div className='flex items-center gap-2 rounded-lg border bg-muted p-3'>
                                <code className='flex-1 break-all font-mono text-sm'>
                                  {totpSecret}
                                </code>
                                <Button
                                  onClick={() => {
                                    navigator.clipboard.writeText(totpSecret)
                                    toast.success('Secret copied to clipboard')
                                  }}
                                  size='sm'
                                  variant='outline'
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className='rounded-lg border bg-white p-4'>
                              <QRCode level='M' size={180} value={totpUri} />
                            </div>
                          )}
                        </div>

                        <div className='flex justify-center'>
                          <Button
                            onClick={() => setTwoFactorShowSecret(!twoFactorShowSecret)}
                            size='sm'
                            variant='ghost'
                          >
                            {twoFactorShowSecret ? 'Show QR Code' : 'Show Secret Key'}
                          </Button>
                        </div>

                        <form
                          className='space-y-4'
                          onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            verifyTwoFactorForm.handleSubmit(e)
                          }}
                        >
                          <verifyTwoFactorForm.Field name='code'>
                            {(field) => (
                              <Field className='space-y-2'>
                                <FieldLabel htmlFor={field.name}>
                                  Enter code from authenticator
                                </FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                  placeholder='000000'
                                  required
                                  type='text'
                                  value={field.state.value}
                                />
                                {field.state.meta.errors.length > 0 && (
                                  <FieldError errors={field.state.meta.errors} />
                                )}
                              </Field>
                            )}
                          </verifyTwoFactorForm.Field>

                          <DialogFooter className='pt-4'>
                            <Button
                              disabled={isEnablingTwoFactor}
                              onClick={() => setTwoFactorStep('password')}
                              type='button'
                              variant='outline'
                            >
                              Back
                            </Button>
                            <Button disabled={isEnablingTwoFactor} type='submit'>
                              {isEnablingTwoFactor ? 'Verifying...' : 'Enable 2FA'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </div>
                    )}

                    {twoFactorStep === 'success' && (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                            <HugeiconsIcon className='size-6 text-green-600' icon={Shield02Icon} />
                          </div>
                          <h3 className='font-medium'>2FA Enabled Successfully</h3>
                          <p className='text-muted-foreground text-sm'>
                            Save these backup codes in a safe place. You can use them if you lose
                            access to your authenticator app.
                          </p>
                        </div>

                        <div className='rounded-lg bg-muted p-4'>
                          <div className='mb-2 flex items-center justify-between'>
                            <p className='font-medium text-sm'>Backup codes</p>
                            <Button
                              onClick={() =>
                                downloadBackupCodes(backupCodes, 'flux-backup-codes.txt')
                              }
                              size='sm'
                              variant='ghost'
                            >
                              Download
                            </Button>
                          </div>
                          <div className='grid grid-cols-2 gap-2 text-sm'>
                            {backupCodes.map((code) => (
                              <code className='font-mono' key={code}>
                                {code}
                              </code>
                            ))}
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() => {
                              setIsEnableTwoFactorDialogOpen(false)
                              setTwoFactorStep('password')
                              setTwoFactorShowSecret(false)
                              setTotpUri('')
                              setTotpSecret('')
                              setBackupCodes([])
                              enableTwoFactorForm.reset()
                              verifyTwoFactorForm.reset()
                            }}
                          >
                            Done
                          </Button>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-destructive/50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <HugeiconsIcon className='size-5' icon={Alert02Icon} />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='border border-destructive/50 bg-destructive/5 p-4'>
            <h4 className='font-medium text-destructive'>Delete Account</h4>
            <p className='mt-1 text-muted-foreground text-sm'>
              Once you delete your account, there is no going back. All your data, transactions, and
              settings will be permanently removed.
            </p>
            <Dialog onOpenChange={setIsDeleteDialogOpen} open={isDeleteDialogOpen}>
              <DialogTrigger
                render={
                  <Button className='mt-3' size='sm' variant='destructive'>
                    Delete Account
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and all
                    associated data.
                  </DialogDescription>
                </DialogHeader>
                <div className='py-4'>
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor='confirm-delete'>
                      Type <span className='font-bold font-mono'>DELETE</span> to confirm
                    </FieldLabel>
                    <Input
                      id='confirm-delete'
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder='DELETE'
                      value={deleteConfirmation}
                    />
                  </Field>
                </div>
                <DialogFooter>
                  <Button
                    disabled={isDeleting}
                    onClick={() => setIsDeleteDialogOpen(false)}
                    variant='outline'
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    onClick={handleDeleteAccount}
                    variant='destructive'
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
