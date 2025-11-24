import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function LinkedinRedirect() {
  redirect(siteConfig.social.linkedin)
}
