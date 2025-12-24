import { redirect } from 'next/navigation'
import { siteConfig } from '@/config/site'

export default function ResumeRedirect() {
  redirect(siteConfig.external.cv)
}
