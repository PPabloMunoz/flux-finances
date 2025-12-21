import {
  AnalyticsUpIcon,
  ArrowDownLeft01Icon,
  ArrowRight02Icon,
  CloudServerIcon,
  DashboardSquare02Icon,
  DatabaseIcon,
  Dollar02Icon,
  GitMergeIcon,
  Globe02Icon,
  PackageIcon,
  PieChartIcon,
  ReactIcon,
  SecurityLockIcon,
  ServerStack02Icon,
  ServerStack03Icon,
  ShoppingBasket01Icon,
  Tick01Icon,
  TradeUpIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import GithubIcon from '@/components/shared/github'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div>
      <p>App</p>
    </div>
  )
}
