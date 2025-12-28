import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Field, FieldError, FieldLabel } from '@flux/ui/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@flux/ui/components/ui/native-select'
import { Calendar01Icon, Globe02Icon, Settings05Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { updateUserPreferencesAction } from '@/features/auth/actions'
import { UpdateUserPreferencesSchema } from '@/features/auth/schema'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { DATE_FORMAT_OPTIONS, SORTED_COUNTRIES, SORTED_TIMEZONES } from '@/lib/constants'

export default function PreferencesSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const { data: userPreferences, isPending } = useUserPreferences()
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      region: userPreferences?.region || '',
      dateFormat: userPreferences?.dateFormat || '',
      timezone: userPreferences?.timezone || '',
    },
    validators: { onSubmit: UpdateUserPreferencesSchema },
    onSubmit: async ({ value }) => {
      // No changes made
      if (
        value.region === userPreferences?.region &&
        value.dateFormat === userPreferences?.dateFormat &&
        value.timezone === userPreferences?.timezone
      ) {
        toast.info('No changes made to user preferences.')
        return
      }

      const parsed = UpdateUserPreferencesSchema.safeParse(value)
      if (!parsed.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await updateUserPreferencesAction({ data: parsed.data })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('User preferences updated successfully.')
        queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      }
    },
  })

  return (
    <div className='space-y-6'>
      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Settings05Icon} />
            User Preferences
          </CardTitle>
          <CardDescription>Set your preferred timezone and date format.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit(e)
            }}
          >
            <form.Field name='region'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor={field.name}>
                      <HugeiconsIcon className='size-4' icon={Globe02Icon} />
                      Region
                    </FieldLabel>
                    <NativeSelect
                      disabled={isPending || isLoading}
                      id={field.name}
                      name={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    >
                      <NativeSelectOption disabled value=''>
                        Select your region
                      </NativeSelectOption>
                      {SORTED_COUNTRIES.map((country) => (
                        <NativeSelectOption key={country.code} value={country.code}>
                          {country.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='dateFormat'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor={field.name}>
                      <HugeiconsIcon className='size-4' icon={Calendar01Icon} />
                      Date Format
                    </FieldLabel>
                    <NativeSelect
                      disabled={isPending || isLoading}
                      id={field.name}
                      name={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    >
                      <NativeSelectOption disabled value=''>
                        Select your date format
                      </NativeSelectOption>
                      {DATE_FORMAT_OPTIONS.map((format) => (
                        <NativeSelectOption key={format.code} value={format.code}>
                          {format.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='timezone'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field className='space-y-2'>
                    <FieldLabel htmlFor={field.name}>
                      <HugeiconsIcon className='size-4' icon={Globe02Icon} />
                      Timezone
                    </FieldLabel>
                    <NativeSelect
                      disabled={isPending || isLoading}
                      id={field.name}
                      name={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                    >
                      <NativeSelectOption disabled value=''>
                        Select your timezone
                      </NativeSelectOption>
                      {SORTED_TIMEZONES.map((timezone) => (
                        <NativeSelectOption key={timezone.code} value={timezone.code}>
                          {timezone.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant='outline'>Cancel</Button>
              <Button type='submit'>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
