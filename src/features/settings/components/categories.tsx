import {
  Add01Icon,
  Delete03Icon,
  Loading03Icon,
  StructureFolderIcon,
  Upload03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { createCategoryAction, deleteCategoryAction } from '../actions'
import { getCategoriesAction } from '../queries'

const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`

export default function CategoriesSettings() {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(getRandomColor())
  const [newCategoryType, setNewCategoryType] = useState<'inflow' | 'outflow'>('outflow')

  const {
    data: categories,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategoriesAction({ data: {} })
      if (!res.ok) {
        throw new Error(res.error)
      }
      return res.data
    },
  })

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await createCategoryAction({
        data: {
          name: newCategoryName,
          color: newCategoryColor,
          type: newCategoryType,
        },
      })
      if (!res.ok) {
        throw new Error(res.error)
      }
      return res.data
    },
    onSuccess: () => {
      toast.success('Category created')
      refetch()
      setNewCategoryName('')
      setNewCategoryColor(getRandomColor())
      setNewCategoryType('outflow')
    },
    onError: () => {
      toast.error('Failed to create category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategoryAction({ data: { id } })
      if (!res.ok) {
        throw new Error(res.error)
      }
    },
    onSuccess: () => {
      toast.success('Category deleted')
      refetch()
    },
    onError: () => {
      toast.error('Failed to delete category')
    },
  })

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    createCategoryMutation.mutate()
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-2'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <HugeiconsIcon className='size-5 text-primary' icon={StructureFolderIcon} />
              Transaction Categories
            </CardTitle>
            <CardDescription>Manage your transaction categories and their colors</CardDescription>
          </div>
          <Link to='/settings/categories/import'>
            <Button variant='outline'>
              <HugeiconsIcon icon={Upload03Icon} size={20} />
              Import
            </Button>
          </Link>
        </CardHeader>
        <CardContent className='space-y-8'>
          {/* Add New Category */}
          <div className='rounded-lg border border-border bg-muted/30 p-4'>
            <Label
              className='mb-3 block text-muted-foreground text-xs uppercase tracking-wider'
              htmlFor='newCategory'
            >
              Add New Category
            </Label>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <div className='flex gap-2'>
                <div className='flex items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm'>
                  <input
                    className='h-6 w-6 cursor-pointer border-none bg-transparent p-0'
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    title='Choose category color'
                    type='color'
                    value={newCategoryColor}
                  />
                </div>
                <NativeSelect
                  className='w-full sm:w-[130px]'
                  onChange={(e) => setNewCategoryType(e.target.value as 'inflow' | 'outflow')}
                  value={newCategoryType}
                >
                  <NativeSelectOption value='outflow'>Expense</NativeSelectOption>
                  <NativeSelectOption value='inflow'>Income</NativeSelectOption>
                </NativeSelect>
              </div>
              <div className='flex flex-1 gap-2'>
                <Input
                  className='flex-1'
                  id='newCategory'
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory()
                  }}
                  placeholder='Category name (e.g. Groceries)'
                  value={newCategoryName}
                />
                <Button
                  className='shrink-0'
                  disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                  onClick={handleAddCategory}
                >
                  {createCategoryMutation.isPending ? (
                    <HugeiconsIcon className='size-4 animate-spin' icon={Loading03Icon} />
                  ) : (
                    <HugeiconsIcon className='size-4' icon={Add01Icon} />
                  )}
                  <span className='ml-2 hidden sm:inline'>Add</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Categories */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label className='text-muted-foreground text-xs uppercase tracking-wider'>
                Your Categories
              </Label>
              <span className='text-muted-foreground text-xs'>{categories?.length ?? 0} total</span>
            </div>

            <div className='rounded-lg border border-border bg-muted/20'>
              {isLoading ? (
                <div className='flex flex-col items-center justify-center gap-2 py-12'>
                  <HugeiconsIcon
                    className='size-8 animate-spin text-primary/50'
                    icon={Loading03Icon}
                  />
                  <p className='text-muted-foreground text-xs'>Loading categories...</p>
                </div>
              ) : (
                <div className='divide-y divide-border'>
                  {categories?.map((category) => (
                    <div
                      className='group flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50'
                      key={category.id}
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className='size-5 rounded-full border-2 border-background shadow-sm'
                          style={{ backgroundColor: category.color ?? '#000000' }}
                        />
                        <div className='flex flex-col'>
                          <span className='font-medium text-sm'>{category.name}</span>
                          <span className='text-[10px] text-muted-foreground uppercase tracking-widest'>
                            {category.type === 'inflow' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <Badge
                          className={`pointer-events-none px-2 py-0 font-semibold text-[10px] uppercase ${
                            category.type === 'inflow'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                          }`}
                          variant='secondary'
                        >
                          {category.type}
                        </Badge>
                        <Button
                          className='h-8 w-8 bg-transparent p-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100'
                          disabled={deleteCategoryMutation.isPending}
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          size='sm'
                        >
                          {deleteCategoryMutation.isPending ? (
                            <HugeiconsIcon className='size-3.5 animate-spin' icon={Loading03Icon} />
                          ) : (
                            <HugeiconsIcon className='size-3.5' icon={Delete03Icon} />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {categories?.length === 0 && (
                    <div className='flex flex-col items-center justify-center gap-2 py-12'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                        <HugeiconsIcon
                          className='size-6 text-muted-foreground'
                          icon={StructureFolderIcon}
                        />
                      </div>
                      <div className='text-center'>
                        <p className='font-medium text-sm'>No categories found</p>
                        <p className='text-muted-foreground text-xs'>
                          Add your first category above to get started.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
