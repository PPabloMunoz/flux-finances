import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAllAccountsAction } from '@/features/accounts/queries'
import { ACCOUNT_TYPES_ICONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createTransferAction } from '../actions'
import { TransferSchema } from '../schema'

export const newTransferModalHandle = BaseUIDialog.createHandle()

interface Props {
  onConfirm?: () => void
}

export default function NewTransferModal({ onConfirm }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data: accounts = [], isPending: accountsPending } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await getAllAccountsAction()
      if (!res.ok) {
        toast.error(res.error)
        return []
      }
      return res.data
    },
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  })

  const isDisabled = accountsPending || isLoading

  const form = useForm({
    defaultValues: {
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    },
    validators: { onSubmit: TransferSchema },
    onSubmit: async ({ value }) => {
      if (isDisabled) return
      const parsedValue = TransferSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await createTransferAction({
        data: {
          ...parsedValue.data,
          amount: parsedValue.data.amount.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Transfer created successfully!')
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['transactions-summary'] })
        queryClient.invalidateQueries({ queryKey: ['networth'] })
        queryClient.invalidateQueries({ queryKey: ['incomeVsExpenses'] })
        newTransferModalHandle.close()
        form.reset()
        onConfirm?.()
      }
    },
  })

  const fromAccountId = form.store.state.values.fromAccountId
  const toAccountId = form.store.state.values.toAccountId

  const availableToAccounts = accounts.filter((acc) => acc.id !== fromAccountId)
  const availableFromAccounts = accounts.filter((acc) => acc.id !== toAccountId)

  return (
    <Dialog handle={newTransferModalHandle}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Transfer</DialogTitle>
          <DialogDescription>Move money between your accounts.</DialogDescription>
        </DialogHeader>

        <form
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit(e)
          }}
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.Field name='fromAccountId'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                const selectedAccount = accounts.find((acc) => acc.id === field.state.value)
                return (
                  <Field className='relative'>
                    <FieldLabel htmlFor={field.name}>From Account</FieldLabel>
                    <Select
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      value={field.state.value}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(accountId: string) => {
                            if (!accountId) return 'Select account'
                            return (
                              <span className='flex items-center gap-2'>
                                <div
                                  className={cn(
                                    'flex size-4.5 items-center justify-center rounded-sm text-white shadow-lg',
                                    selectedAccount?.type === 'cash' &&
                                      'bg-blue-700 shadow-blue-900/20',
                                    selectedAccount?.type === 'investment' &&
                                      'bg-teal-700 shadow-teal-900/20',
                                    selectedAccount?.type === 'liability' &&
                                      'bg-orange-700 shadow-orange-900/20',
                                    selectedAccount?.type === 'other_asset' &&
                                      'bg-slate-700 shadow-slate-900/20'
                                  )}
                                >
                                  <HugeiconsIcon
                                    className='size-3'
                                    icon={
                                      selectedAccount
                                        ? ACCOUNT_TYPES_ICONS[selectedAccount.type]
                                        : ArrowRight01Icon
                                    }
                                  />
                                </div>
                                {selectedAccount ? selectedAccount.name : 'Select account'}
                              </span>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className='overflow-y-auto'>
                        <SelectItem disabled value=''>
                          Select account
                        </SelectItem>
                        {availableFromAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div
                              className={cn(
                                'flex size-5 items-center justify-center rounded-sm text-white shadow-lg',
                                account.type === 'cash' && 'bg-blue-700 shadow-blue-900/20',
                                account.type === 'investment' && 'bg-teal-700 shadow-teal-900/20',
                                account.type === 'liability' &&
                                  'bg-orange-700 shadow-orange-900/20',
                                account.type === 'other_asset' && 'bg-slate-700 shadow-slate-900/20'
                              )}
                            >
                              <HugeiconsIcon
                                className='size-3'
                                icon={ACCOUNT_TYPES_ICONS[account.type]}
                              />
                            </div>
                            <span>{account.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='toAccountId'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                const selectedAccount = accounts.find((acc) => acc.id === field.state.value)
                return (
                  <Field className='relative'>
                    <FieldLabel htmlFor={field.name}>To Account</FieldLabel>
                    <Select
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onValueChange={(value) => field.handleChange(value ?? '')}
                      value={field.state.value}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {(accountId: string) => {
                            if (!accountId) return 'Select account'
                            return (
                              <span className='flex items-center gap-2'>
                                <div
                                  className={cn(
                                    'flex size-4.5 items-center justify-center rounded-sm text-white shadow-lg',
                                    selectedAccount?.type === 'cash' &&
                                      'bg-blue-700 shadow-blue-900/20',
                                    selectedAccount?.type === 'investment' &&
                                      'bg-teal-700 shadow-teal-900/20',
                                    selectedAccount?.type === 'liability' &&
                                      'bg-orange-700 shadow-orange-900/20',
                                    selectedAccount?.type === 'other_asset' &&
                                      'bg-slate-700 shadow-slate-900/20'
                                  )}
                                >
                                  <HugeiconsIcon
                                    className='size-3'
                                    icon={
                                      selectedAccount
                                        ? ACCOUNT_TYPES_ICONS[selectedAccount.type]
                                        : ArrowRight01Icon
                                    }
                                  />
                                </div>
                                {selectedAccount ? selectedAccount.name : 'Select account'}
                              </span>
                            )
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className='overflow-y-auto'>
                        <SelectItem disabled value=''>
                          Select account
                        </SelectItem>
                        {availableToAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div
                              className={cn(
                                'flex size-5 items-center justify-center rounded-sm text-white shadow-lg',
                                account.type === 'cash' && 'bg-blue-700 shadow-blue-900/20',
                                account.type === 'investment' && 'bg-teal-700 shadow-teal-900/20',
                                account.type === 'liability' &&
                                  'bg-orange-700 shadow-orange-900/20',
                                account.type === 'other_asset' && 'bg-slate-700 shadow-slate-900/20'
                              )}
                            >
                              <HugeiconsIcon
                                className='size-3'
                                icon={ACCOUNT_TYPES_ICONS[account.type]}
                              />
                            </div>
                            <span>{account.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <form.Field name='amount'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      min='0'
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder='e.g. 100.00'
                      spellCheck={false}
                      step='0.01'
                      type='number'
                      value={field.state.value || ''}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name='date'>
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      disabled={isDisabled}
                      id={field.name}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type='date'
                      value={field.state.value || ''}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                )
              }}
            </form.Field>
          </div>

          <Button className='w-full' disabled={isLoading} type='submit'>
            <HugeiconsIcon icon={ArrowRight01Icon} />
            {isLoading ? 'Creating...' : 'Create Transfer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
