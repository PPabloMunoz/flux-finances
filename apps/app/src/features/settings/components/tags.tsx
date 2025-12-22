import { Badge } from '@flux/ui/components/ui/badge'
import { Button } from '@flux/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@flux/ui/components/ui/card'
import { Input } from '@flux/ui/components/ui/input'
import { Label } from '@flux/ui/components/ui/label'
import { Add01Icon, MultiplicationSignIcon, Tag01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

const initialTags = [
  { id: 1, name: 'Business', color: 'bg-blue-500' },
  { id: 2, name: 'Personal', color: 'bg-green-500' },
  { id: 3, name: 'Vacation', color: 'bg-purple-500' },
  { id: 4, name: 'Emergency', color: 'bg-red-500' },
  { id: 5, name: 'Investment', color: 'bg-yellow-500' },
]

export default function TagsSettings() {
  const [tags, setTags] = useState(initialTags)
  const [newTagName, setNewTagName] = useState('')

  const handleDeleteTag = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Tag01Icon} />
            Transaction Tags
          </CardTitle>
          <CardDescription>Create and manage tags to organize your transactions</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Add New Tag */}
          <div className='space-y-3'>
            <Label htmlFor='newTag'>Add New Tag</Label>
            <div className='flex gap-2'>
              <Input
                id='newTag'
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder='Enter tag name...'
                value={newTagName}
              />
              <Button className='shrink-0'>
                <HugeiconsIcon className='mr-2 size-4' icon={Add01Icon} />
                Add Tag
              </Button>
            </div>
          </div>

          {/* Existing Tags */}
          <div className='space-y-3'>
            <Label>Your Tags</Label>
            <div className='border border-border bg-muted/50 p-4'>
              <div className='space-y-2'>
                {tags.map((tag) => (
                  <div
                    className='flex items-center justify-between rounded-sm bg-card px-3 py-2.5 transition-colors hover:bg-accent'
                    key={tag.id}
                  >
                    <div className='flex items-center gap-3'>
                      <div className={`h-3 w-3 rounded-full ${tag.color}`} />
                      <span className='font-medium text-sm'>{tag.name}</span>
                    </div>
                    <Button
                      className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                      onClick={() => handleDeleteTag(tag.id)}
                      size='sm'
                      variant='ghost'
                    >
                      <HugeiconsIcon className='size-4' icon={MultiplicationSignIcon} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <p className='text-muted-foreground text-xs'>
              Tags help you organize and filter transactions. You can assign multiple tags to a
              single transaction.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tag Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Tag Usage</CardTitle>
          <CardDescription>See how often each tag is used</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {tags.map((tag) => (
              <div className='flex items-center justify-between' key={tag.id}>
                <div className='flex items-center gap-3'>
                  <div className={`h-3 w-3 rounded-full ${tag.color}`} />
                  <span className='font-medium text-sm'>{tag.name}</span>
                </div>
                <Badge className='font-mono' variant='secondary'>
                  {Math.floor(Math.random() * 50)} transactions
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
