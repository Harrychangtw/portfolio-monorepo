import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function SpotifyRedirect() {
  redirect(siteConfig.social.spotify.url)
}
