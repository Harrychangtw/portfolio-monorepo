import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function BeliRedirect() {
  redirect(siteConfig.social.beli)
}
