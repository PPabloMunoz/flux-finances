import { Alert02Icon, Mail02Icon, Wallet02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { updateNotificationPreferencesAction } from '@/features/auth/actions'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useQueryClient } from '@tanstack/react-query'

export default function NotificationsSettings() {
  const { data: userPreferences, isPending } = useUserPreferences()
  const queryClient = useQueryClient()

  const handleToggle = async (key: 'emailSummaries' | 'budgetAlerts' | 'transactionReminders') => {
    if (!userPreferences) return

    const newValue = !userPreferences[key]
    const res = await updateNotificationPreferencesAction({
      data: {
        emailSummaries: key === 'emailSummaries' ? newValue : userPreferences.emailSummaries,
        budgetAlerts: key === 'budgetAlerts' ? newValue : userPreferences.budgetAlerts,
        transactionReminders:
          key === 'transactionReminders' ? newValue : userPreferences.transactionReminders,
      },
    })

    if (!res.ok) {
      toast.error(res.error)
    } else {
      toast.success('Notification preferences updated.')
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
      console.log(`[NOTIFICATION] ${key} set to ${newValue}`)
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <HugeiconsIcon className='size-5' icon={Alert02Icon} />
            Notification Preferences
          </CardTitle>
          <CardDescription>Manage how you receive notifications and updates.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <HugeiconsIcon className='size-5 text-muted-foreground' icon={Mail02Icon} />
              <div>
                <p className='font-medium text-sm'>Email Summaries</p>
                <p className='text-muted-foreground text-xs'>
                  Receive periodic summaries of your finances via email.
                </p>
              </div>
            </div>
            <Switch
              checked={userPreferences?.emailSummaries ?? true}
              disabled={isPending}
              onCheckedChange={() => handleToggle('emailSummaries')}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <HugeiconsIcon className='size-5 text-muted-foreground' icon={Wallet02Icon} />
              <div>
                <p className='font-medium text-sm'>Budget Alerts</p>
                <p className='text-muted-foreground text-xs'>
                  Get notified when you approach or exceed budget limits.
                </p>
              </div>
            </div>
            <Switch
              checked={userPreferences?.budgetAlerts ?? true}
              disabled={isPending}
              onCheckedChange={() => handleToggle('budgetAlerts')}
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <HugeiconsIcon className='size-5 text-muted-foreground' icon={Alert02Icon} />
              <div>
                <p className='font-medium text-sm'>Transaction Reminders</p>
                <p className='text-muted-foreground text-xs'>
                  Receive reminders for recurring transactions and bills.
                </p>
              </div>
            </div>
            <Switch
              checked={userPreferences?.transactionReminders ?? false}
              disabled={isPending}
              onCheckedChange={() => handleToggle('transactionReminders')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
