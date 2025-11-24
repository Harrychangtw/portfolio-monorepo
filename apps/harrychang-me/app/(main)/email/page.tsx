import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function EmailRedirect() {
  redirect(`mailto:${siteConfig.author.email}`)
}
