import { authClient } from '@flux/auth/client'
import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Field, FieldError, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { Alert02Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface Props {
  personalInfo: { email: string; fullName: string }
  household: { id: string; householdName: string }
}

const PersonalInfoValidator = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
})
const HouseholdValidator = z.object({
  householdName: z.string().min(2, 'Household name must be at least 2 characters long'),
})

export default function ProfileSettings({ personalInfo, household }: Props) {
  const { data: org } = authClient.useActiveOrganization()

  const personalInfoForm = useForm({
    defaultValues: { fullName: personalInfo.fullName },
    validators: { onChange: PersonalInfoValidator },
    onSubmit: async ({ value }) => {
      if (value.fullName === personalInfo.fullName) return toast.info('No changes detected')
      const { error } = await authClient.updateUser({ name: value.fullName })
      if (error) toast.error(`Error updating profile: ${error.message}`)
      else toast.success('Profile updated successfully')
    },
  })

  const householdForm = useForm({
    defaultValues: { householdName: org?.name || 'loading...' },
    validators: { onChange: HouseholdValidator },
    onSubmit: async ({ value }) => {
      if (value.householdName === household.householdName) return toast.info('No changes detected')
      const res = await authClient.organization.update({
        organizationId: org?.id || '',
        data: { name: value.householdName },
      })

      if (res.error) {
        toast.error(`Error updating household: ${res.error.message}`)
      } else {
        toast.success('Household updated successfully')
      }
    },
  })

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
                defaultValue={personalInfo.email}
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
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={personalInfo.fullName}
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
            <HugeiconsIcon className='size-5' icon={UserGroupIcon} />
            Household Settings
          </CardTitle>
          <CardDescription>Manage shared account and household members</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              householdForm.handleSubmit(e)
            }}
          >
            <householdForm.Field name='householdName'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor={field.name}>Household Name</FieldLabel>
                    <Input
                      defaultValue={field.state.value}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={household.householdName}
                      required
                      type='text'
                      value={field.state.value}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </householdForm.Field>

            <div className='border border-border bg-muted/50 p-4'>
              <h4 className='mb-3 font-medium text-muted-foreground text-sm'>
                Household Members (Coming Soon)
              </h4>
              <div className='space-y-2'>
                <div className='flex items-center justify-between rounded-md bg-card px-3 py-2'>
                  <div>
                    <p className='font-medium text-sm'>
                      {personalInfo.fullName}{' '}
                      <span className='text-muted-foreground text-xs'>(You)</span>
                    </p>
                    <p className='text-muted-foreground text-xs'>{personalInfo.email} • Admin</p>
                  </div>
                </div>
                <div className='flex items-center justify-between rounded-md bg-card px-3 py-2 opacity-50'>
                  <div>
                    <p className='font-medium text-sm'>Jane Doe</p>
                    <p className='text-muted-foreground text-xs'>jane.doe@example.com • Member</p>
                  </div>
                  <Button className='text-muted-foreground' disabled size='sm' variant='ghost'>
                    Remove
                  </Button>
                </div>
              </div>
              <Button className='mt-3 w-full bg-transparent' disabled size='sm' variant='outline'>
                Invite Member
              </Button>
            </div>

            <div className='flex w-full justify-between gap-2 pt-4'>
              <Button variant='destructive'>Leave Household</Button>
              <div className='flex gap-2'>
                <Button onClick={() => householdForm.reset()} variant='outline'>
                  Reset
                </Button>
                <Button type='submit'>Save Changes</Button>
              </div>
            </div>
          </form>
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
            <Button className='mt-3' size='sm' variant='destructive'>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
