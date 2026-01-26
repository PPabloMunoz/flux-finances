import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
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
import { ChangePasswordSchema } from '@/features/auth'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const PersonalInfoValidator = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
})

export default function ProfileSettings() {
  const { data: currentSession, error } = authClient.useSession()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [deleteConfirmationPassword, setDeleteConfirmationPassword] = useState('')

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.')
      return
    }

    if (!deleteConfirmationPassword) {
      toast.error('Introduce your password')
      return
    }

    await authClient.deleteUser(
      { password: deleteConfirmationPassword },
      {
        onRequest: () => setIsDeleting(true),
        onResponse: () => setIsDeleting(false),
        onError: ({ error }) => {
          toast.error(`Error deleting account: ${error.message}`)
        },
        onSuccess: () => {
          toast.success('Account deleted successfully.')
          navigate({ to: '/' })
          setIsDeleteDialogOpen(false)
          setDeleteConfirmation('')
        },
      }
    )
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
              <FieldLabel className='text-muted-foreground' htmlFor='email'>
                Email Address
              </FieldLabel>
              <Input
                className='bg-muted/50'
                defaultValue={
                  error ? 'ERROR LOADING EMAIL' : currentSession?.user.email || 'Loading...'
                }
                disabled
                name='email'
                required
                type='email'
              />
              <p className='text-muted-foreground/70 text-xs'>Email address cannot be changed</p>
            </Field>

            <personalInfoForm.Field name='fullName'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                      Full Name
                    </FieldLabel>
                    <Input
                      className={cn(error || (!currentSession && 'cursor-not-allowed opacity-50'))}
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
                    {isInvalid ? <FieldError errors={field.state.meta.errors} /> : null}
                  </Field>
                )
              }}
            </personalInfoForm.Field>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                disabled={!personalInfoForm.state.isDirty || isLoading}
                onClick={() => personalInfoForm.reset()}
                variant='outline'
              >
                Reset
              </Button>
              <Button disabled={!personalInfoForm.state.isDirty || isLoading} type='submit'>
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
                        <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                          Current Password
                        </FieldLabel>
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
                        <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                          New Password
                        </FieldLabel>
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
                        <FieldLabel className='text-muted-foreground' htmlFor={field.name}>
                          Confirm New Password
                        </FieldLabel>
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
        </CardContent>
      </Card>

      <Card className='border-destructive/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <HugeiconsIcon className='size-5' icon={Alert02Icon} />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-lg border border-destructive/20 bg-destructive/5 p-4'>
            <h4 className='font-medium text-destructive'>Delete Account</h4>
            <p className='mt-1 text-muted-foreground/70 text-sm'>
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
                <div className='space-y-4 py-4'>
                  <Field className='space-y-1'>
                    <FieldLabel className='text-muted-foreground' htmlFor='confirm-delete'>
                      Type <span className='font-bold font-mono'>DELETE</span> to confirm
                    </FieldLabel>
                    <Input
                      id='confirm-delete'
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder='DELETE'
                      value={deleteConfirmation}
                    />
                  </Field>
                  <Field className='space-y-1'>
                    <FieldLabel className='text-muted-foreground' htmlFor='confirm-delete-password'>
                      Type your password
                    </FieldLabel>
                    <Input
                      id='confirm-delete-password'
                      onChange={(e) => setDeleteConfirmationPassword(e.target.value)}
                      placeholder='••••••••'
                      type='password'
                      value={deleteConfirmationPassword}
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
                    disabled={
                      deleteConfirmation !== 'DELETE' || !deleteConfirmationPassword || isDeleting
                    }
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
