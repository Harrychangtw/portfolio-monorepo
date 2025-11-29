import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function GitHubIssuesRedirect() {
  redirect(siteConfig.social.issues)
}
