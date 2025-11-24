import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function InstagramMainRedirect() {
  redirect(siteConfig.social.personalInstagram.url)
}
