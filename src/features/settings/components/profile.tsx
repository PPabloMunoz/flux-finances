import {
  Alert02Icon,
  ComputerIcon,
  Delete02Icon,
  Key01Icon,
  Link01Icon,
  Logout01Icon,
  Shield02Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import GithubIcon from '@/components/github'
import GoogleIcon from '@/components/google'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import { deleteAccountAction } from '@/features/auth/actions'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const PersonalInfoValidator = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
})

export default function ProfileSettings() {
  const { data, error } = authClient.useSession()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const personalInfoForm = useForm({
    defaultValues: { fullName: error ? 'Error loading name' : data?.user.name || 'Loading...' },
    validators: { onChange: PersonalInfoValidator },
    onSubmit: async ({ value }) => {
      if (value.fullName === data?.user.name) return toast.info('No changes detected')
      const { error } = await authClient.updateUser({ name: value.fullName })
      if (error) toast.error(`Error updating profile: ${error.message}`)
      else toast.success('Profile updated successfully')
    },
  })

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion.')
      return
    }

    setIsDeleting(true)
    const res = await deleteAccountAction()
    setIsDeleting(false)

    if (!res.ok) {
      toast.error(res.error)
    } else {
      console.log('[DELETE_ACCOUNT] Account deletion initiated')
      toast.success(
        'Account deletion initiated. This is a placeholder - full deletion requires backend implementation.'
      )
      setIsDeleteDialogOpen(false)
      setDeleteConfirmation('')
    }
  }

  // Placeholders
  const handleConnectGoogle = () => console.log('Connect Google')
  const handleConnectGithub = () => console.log('Connect Github')
  const handleSetPassword = () => console.log('Set Password')
  const handleEnable2FA = () => {
    console.log('Enable 2FA')
  }
  const handleAddPasskey = () => console.log('Add Passkey')
  const handleDeletePasskey = (id: string) => console.log('Delete Passkey', id)
  const handleRevokeSession = (id: string) => console.log('Revoke Session', id)

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
                defaultValue={error ? 'ERROR LOADING EMAIL' : data?.user.email || 'Loading...'}
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
                      className={cn('', error || (!data && 'cursor-not-allowed opacity-50'))}
                      disabled={!!error || !data}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={data?.user.name}
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
                disabled={personalInfoForm.state.isDirty}
                onClick={() => personalInfoForm.reset()}
                variant='outline'
              >
                Reset
              </Button>
              <Button disabled={personalInfoForm.state.isDirty} type='submit'>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Link01Icon} />
            Connected Accounts
          </CardTitle>
          <CardDescription>Manage your connected social accounts</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted/50'>
                <GoogleIcon className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium text-sm'>Google</p>
                <p className='text-muted-foreground text-xs'>Connect your Google account</p>
              </div>
            </div>
            <Button onClick={handleConnectGoogle} size='sm' variant='outline'>
              Connect
            </Button>
          </div>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted/50'>
                <GithubIcon className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium text-sm'>GitHub</p>
                <p className='text-muted-foreground text-xs'>Connect your GitHub account</p>
              </div>
            </div>
            <Button onClick={handleConnectGithub} size='sm' variant='outline'>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Shield02Icon} />
            Security
          </CardTitle>
          <CardDescription>Manage your password and security settings</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium text-sm'>Password</h4>
              </div>
              <p className='text-muted-foreground text-xs'>Set a password to login with email</p>
            </div>
            <Button onClick={handleSetPassword} size='sm' variant='outline'>
              Set Password
            </Button>
          </div>
          <div className='border-t' />

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <h4 className='font-medium text-sm'>Two-Factor Authentication</h4>
              <p className='text-muted-foreground text-xs'>
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch onCheckedChange={handleEnable2FA} />
          </div>
          <div className='border-t' />

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <h4 className='font-medium text-sm'>Passkeys</h4>
                <p className='text-muted-foreground text-xs'>
                  Login with your biometrics or device
                </p>
              </div>
              <Button onClick={handleAddPasskey} size='sm' variant='outline'>
                Add Passkey
              </Button>
            </div>
            <div className='rounded-lg border p-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <HugeiconsIcon className='size-5 text-muted-foreground' icon={Key01Icon} />
                  <div>
                    <p className='font-medium text-sm'>MacBook Pro</p>
                    <p className='text-muted-foreground text-xs'>Added on Oct 24, 2024</p>
                  </div>
                </div>
                <Button
                  className='h-8 w-8 text-muted-foreground hover:text-destructive'
                  onClick={() => handleDeletePasskey('1')}
                  size='icon'
                  variant='ghost'
                >
                  <HugeiconsIcon className='size-4' icon={Delete02Icon} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={ComputerIcon} />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage your active sessions on other devices</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between rounded-lg border bg-muted/30 p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <HugeiconsIcon className='size-5' icon={ComputerIcon} />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <p className='font-medium text-sm'>Chrome on macOS</p>
                  <Badge className='h-5 px-1.5 text-[10px]' variant='secondary'>
                    Current
                  </Badge>
                </div>
                <p className='text-muted-foreground text-xs'>San Francisco, US • 10.0.0.1</p>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                <HugeiconsIcon className='size-5' icon={SmartPhone01Icon} />
              </div>
              <div>
                <p className='font-medium text-sm'>Safari on iPhone</p>
                <p className='text-muted-foreground text-xs'>
                  San Francisco, US • 10.0.0.2 • Active 2h ago
                </p>
              </div>
            </div>
            <Button
              className='text-muted-foreground hover:text-destructive'
              onClick={() => handleRevokeSession('1')}
              size='sm'
              variant='ghost'
            >
              <HugeiconsIcon className='mr-2 size-4' icon={Logout01Icon} />
              Revoke
            </Button>
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
              <DialogTrigger>
                <Button className='mt-3' size='sm' variant='destructive'>
                  Delete Account
                </Button>
              </DialogTrigger>
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
