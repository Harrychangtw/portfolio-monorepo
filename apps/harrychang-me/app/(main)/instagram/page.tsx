import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function InstagramRedirect() {
  redirect(siteConfig.social.instagram)
}
