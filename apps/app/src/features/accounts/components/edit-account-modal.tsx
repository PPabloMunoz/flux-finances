import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { Button } from '@flux/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@flux/ui/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@flux/ui/components/ui/native-select'
import { cn } from '@flux/ui/lib/utils'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { CURRENCY_CODES } from '@/lib/constants'
import { updateAccountAction } from '../actions'
import { EditAccountSchema } from '../schema'

export const editAccountDialogHandle = BaseUIDialog.createHandle()

const PayloadSchema = EditAccountSchema

export default function EditAccountModal() {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm({
    defaultValues: {
      type: '',
      name: '',
      balance: '',
      id: '',
      isActive: true,
      currency: '',
    },
    validators: { onSubmit: EditAccountSchema },
    onSubmit: async ({ value }) => {
      if (isLoading) return
      const parsedValue = EditAccountSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await updateAccountAction({
        data: {
          ...parsedValue.data,
          balance: parsedValue.data.balance.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Account created successfully')
        queryClient.invalidateQueries({ queryKey: ['accounts', 'cash'] })
        editAccountDialogHandle.close()
        form.reset()
      }
    },
  })
  return (
    <Dialog handle={editAccountDialogHandle}>
      {({ payload }) => {
        const parsedPayload = PayloadSchema.safeParse(payload)
        if (!parsedPayload.success) return null
        form.setFieldValue('type', parsedPayload.data.type)
        form.setFieldValue('name', parsedPayload.data.name)
        form.setFieldValue('balance', parsedPayload.data.balance.toString())
        form.setFieldValue('id', parsedPayload.data.id)
        form.setFieldValue('isActive', parsedPayload.data.isActive)
        form.setFieldValue('currency', parsedPayload.data.currency)

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Account</DialogTitle>
              <DialogDescription>
                Make changes to your account details below and click "Update Account" to save.
              </DialogDescription>
            </DialogHeader>
            <form
              className='flex flex-col gap-4'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit(e)
              }}
            >
              <form.Field name='type'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Account Type</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                        disabled
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Savings, Checking'
                        value={field.state.value}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='name'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Account Name</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Checking Account'
                        value={field.state.value}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='balance'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Initial Balance</FieldLabel>
                      <Input
                        className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                        disabled={isLoading}
                        id={field.name}
                        min={0}
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. 1000'
                        step={0.01}
                        type='number'
                        value={field.state.value}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='currency'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                      <NativeSelect
                        id={field.name}
                        name={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        value={field.state.value}
                      >
                        <NativeSelectOption disabled value=''>
                          Select a currency
                        </NativeSelectOption>
                        {CURRENCY_CODES.map((code) => (
                          <NativeSelectOption key={code} value={code}>
                            {code}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <Button
                className={cn('', isLoading && 'cursor-not-allowed opacity-50')}
                disabled={isLoading}
                type='submit'
              >
                Update Account
              </Button>
            </form>
          </DialogContent>
        )
      }}
    </Dialog>
  )
}
