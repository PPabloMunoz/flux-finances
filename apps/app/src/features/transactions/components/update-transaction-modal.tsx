import { Dialog as BaseUIDialog } from '@base-ui/react/dialog'
import { Button } from '@flux/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@flux/ui/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@flux/ui/components/ui/field'
import { Input } from '@flux/ui/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@flux/ui/components/ui/select'
import { Textarea } from '@flux/ui/components/ui/textarea'
import { cn } from '@flux/ui/lib/utils'
import { AddIcon, Delete03Icon, FloppyDiskIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useForm, useStore } from '@tanstack/react-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAllAccountsAction } from '@/features/accounts/queries'
import { getCategoriesAction } from '@/features/settings/queries'
import type { TCategory } from '@/features/settings/schemas'
import {
  ACCOUNT_TYPES_ICONS,
  TRANSACTIONS_ICONS,
  TRANSACTIONS_TYPE_LABELS,
  TRANSACTIONS_TYPES,
} from '@/lib/constants'
import { updateTransactionAction } from '../actions'
import { UpdateTransactionSchema } from '../schema'
import { deleteTransactionModalHandler } from './delete-transaction-modal'

export const updateTransactionModalHandle = BaseUIDialog.createHandle()

export default function UpdateTransactionModal() {
  const [isLoading, setIsLoading] = useState(false)
  const [categoriesToShow, setCategoriesToShow] = useState<TCategory[]>([])
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
  })

  const { data: categories, isPending: categoriesPending } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: {} })
      if (!res.ok) {
        throw new Error(res.error)
      }
      setCategoriesToShow(res.data)
      return res.data
    },
  })

  const isDisabled = accountsPending || categoriesPending || isLoading

  const form = useForm({
    defaultValues: {
      id: '',
      title: '',
      accountId: '',
      categoryId: '' as string | null,
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: '',
      description: '',
    },
    validators: { onSubmit: UpdateTransactionSchema },
    onSubmit: async ({ value }) => {
      if (isDisabled) return
      const parsedValue = UpdateTransactionSchema.safeParse(value)
      if (!parsedValue.success) {
        toast.error('Please fix the errors in the form.')
        return
      }

      setIsLoading(true)
      const res = await updateTransactionAction({
        data: {
          ...parsedValue.data,
          amount: parsedValue.data.amount.toString(),
        },
      })
      setIsLoading(false)

      if (!res.ok) {
        toast.error(res.error)
      } else {
        toast.success('Transaction updated successfully.')
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['transactions-summary'] })
        updateTransactionModalHandle.close()
        form.reset()
      }
    },
  })
  const transactionType = useStore(form.store, (state) => state.values.type)

  useEffect(() => {
    if (!categories) return
    setCategoriesToShow(
      categories.filter((category) =>
        transactionType === 'inflow' ? category.type === 'inflow' : category.type === 'outflow'
      )
    )
    form.setFieldValue('categoryId', '')
  }, [transactionType, categories, form])

  return (
    <Dialog handle={updateTransactionModalHandle}>
      {({ payload }) => {
        const parsedPayload = UpdateTransactionSchema.safeParse(payload)
        if (!parsedPayload.success) return null

        form.setFieldValue('id', parsedPayload.data.id)
        form.setFieldValue('title', parsedPayload.data.title)
        form.setFieldValue('accountId', parsedPayload.data.accountId)
        form.setFieldValue('categoryId', parsedPayload.data.categoryId || '')
        form.setFieldValue(
          'date',
          parsedPayload.data.date
            ? new Date(parsedPayload.data.date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        )
        form.setFieldValue('amount', parsedPayload.data.amount.toString())
        form.setFieldValue('type', parsedPayload.data.type)
        form.setFieldValue('description', parsedPayload.data.description)

        return (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Transaction</DialogTitle>
              <DialogDescription>Modify the details of your transaction below.</DialogDescription>
            </DialogHeader>

            <form
              className='space-y-4'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit(e)
              }}
            >
              <form.Field name='title'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Transaction Name</FieldLabel>
                      <Input
                        aria-invalid={isInvalid}
                        disabled={isDisabled}
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='e.g. Grocery Shopping'
                        spellCheck={false}
                        value={field.state.value || ''}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

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
                          placeholder='e.g. 50.00'
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

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <form.Field name='accountId'>
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    const selectedAccount = accounts.find((acc) => acc.id === field.state.value)
                    return (
                      <Field className='relative'>
                        <FieldLabel htmlFor={field.name}>Account</FieldLabel>
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
                                if (!accountId) return 'Select an account'
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
                                            : AddIcon
                                        }
                                      />
                                    </div>
                                    {selectedAccount ? selectedAccount.name : 'Select an account'}
                                  </span>
                                )
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className='overflow-y-auto'>
                            <SelectItem disabled value=''>
                              Select an account
                            </SelectItem>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                <div
                                  className={cn(
                                    'flex size-5 items-center justify-center rounded-sm text-white shadow-lg',
                                    account.type === 'cash' && 'bg-blue-700 shadow-blue-900/20',
                                    account.type === 'investment' &&
                                      'bg-teal-700 shadow-teal-900/20',
                                    account.type === 'liability' &&
                                      'bg-orange-700 shadow-orange-900/20',
                                    account.type === 'other_asset' &&
                                      'bg-slate-700 shadow-slate-900/20'
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

                <form.Field name='type'>
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Transaction Type</FieldLabel>
                        <Select
                          aria-invalid={isInvalid}
                          defaultValue={parsedPayload.data.type}
                          disabled={isDisabled}
                          id={field.name}
                          onValueChange={(value) => field.setValue(value ?? TRANSACTIONS_TYPES[1])}
                          value={field.state.value || parsedPayload.data.type}
                        >
                          <SelectTrigger>
                            <SelectValue>
                              {(type: (typeof TRANSACTIONS_TYPES)[number]) => {
                                if (!type) return 'Select a transaction type'
                                return (
                                  <span>
                                    <HugeiconsIcon
                                      className={cn(
                                        'mr-2 inline-block size-4',
                                        type === 'inflow' ? 'text-green-500' : 'text-red-500'
                                      )}
                                      icon={TRANSACTIONS_ICONS[type]}
                                    />
                                    {TRANSACTIONS_TYPE_LABELS[type]}
                                  </span>
                                )
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {TRANSACTIONS_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                <div
                                  className={cn(
                                    'flex size-5 items-center justify-center rounded-sm text-white shadow-lg',
                                    type === 'inflow' && 'bg-green-700 shadow-green-900/20',
                                    type === 'outflow' && 'bg-red-700 shadow-red-900/20'
                                  )}
                                >
                                  <HugeiconsIcon
                                    className='size-3'
                                    icon={TRANSACTIONS_ICONS[type]}
                                  />
                                </div>
                                <span>{TRANSACTIONS_TYPE_LABELS[type]}</span>
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

              <form.Field name='categoryId'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  const currentCategory = categories?.find((cat) => cat.id === field.state.value)
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <Select
                        aria-invalid={isInvalid}
                        disabled={isDisabled}
                        id={field.name}
                        onValueChange={(value) => field.handleChange(value ?? '')}
                        value={field.state.value}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(categoryId: string) => {
                              if (!categoryId) return 'No Category'
                              return (
                                <span className='flex items-center gap-2'>
                                  <div
                                    className='flex size-2.5 items-center justify-center rounded-full border border-neutral-700/30'
                                    style={{
                                      backgroundColor: currentCategory?.color ?? '#000000',
                                    }}
                                  />
                                  {currentCategory ? currentCategory.name : 'No Category'}
                                </span>
                              )
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className='overflow-y-auto'>
                          <SelectItem value=''>No Category</SelectItem>
                          {categoriesToShow.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className='flex items-center gap-2'>
                                <div
                                  className='flex size-2.5 items-center justify-center rounded-full border border-neutral-700/30'
                                  style={{ backgroundColor: category.color ?? '#000000' }}
                                />
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <form.Field name='description'>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Description (optional)</FieldLabel>
                      <Textarea
                        aria-invalid={isInvalid}
                        disabled={isDisabled}
                        id={field.name}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='Add any additional details about the transaction'
                        spellCheck={false}
                        value={field.state.value || ''}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  )
                }}
              </form.Field>

              <div className='mt-4 flex items-center justify-between gap-2'>
                <Button className='w-full flex-1' disabled={isDisabled} type='submit'>
                  <HugeiconsIcon icon={FloppyDiskIcon} />
                  {isLoading ? 'Updating...' : 'Update Transaction'}
                </Button>
                <DialogTrigger
                  handle={deleteTransactionModalHandler}
                  payload={{ id: parsedPayload.data.id }}
                  render={
                    <Button disabled={isDisabled} type='button' variant='destructive'>
                      <HugeiconsIcon icon={Delete03Icon} />
                    </Button>
                  }
                />
              </div>
            </form>
          </DialogContent>
        )
      }}
    </Dialog>
  )
}
