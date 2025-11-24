import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function InstagramArtRedirect() {
  redirect(siteConfig.social.artInstagram.url)
}
