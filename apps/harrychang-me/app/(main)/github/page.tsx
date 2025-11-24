import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function GitHubRedirect() {
  redirect(siteConfig.social.github)
}
