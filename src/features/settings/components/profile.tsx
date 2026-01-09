import { Alert02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth/client'
import { cn } from '@/lib/utils'

const PersonalInfoValidator = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
})

export default function ProfileSettings() {
  const { data, error } = authClient.useSession()

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
