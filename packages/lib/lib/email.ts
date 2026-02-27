import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not found in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWaitlistConfirmationParams {
  email: string;
  firstName?: string;
  lastName?: string;
  locale: string;
}

export async function sendWaitlistConfirmationEmail({
  email,
  firstName,
  lastName,
  locale
}: SendWaitlistConfirmationParams) {
  const displayName = firstName 
    ? `${firstName}${lastName ? ' ' + lastName : ''}`
    : email.split('@')[0];

  const isZhTw = locale === 'zh-TW';

  // Updated subject lines to reflect the new Application model
  const subject = isZhTw 
    ? '申請已收悉：Icarus Lab by Harry Chang'
    : 'Application Received: Icarus Lab by Harry Chang';

  const htmlContent = getEmailTemplate(displayName, locale);

  try {
    const data = await resend.emails.send({
      from: 'Harry Chang Lab <lab@harrychang.me>',
      to: [email],
      subject,
      html: htmlContent,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function getEmailTemplate(displayName: string, locale: string): string {
  const isZhTw = locale === 'zh-TW';
  const templateFileName = isZhTw 
    ? 'waitlist-confirmation-zh-tw.html' 
    : 'waitlist-confirmation-en.html';
  
  const templatePath = path.join(process.cwd(), 'components', 'lab', 'email-templates', templateFileName);
  
  try {
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders with actual values
    template = template.replace(/\{\{displayName\}\}/g, displayName);
    
    // Position replacement removed entirely
    
    return template;
  } catch (error) {
    console.error('Failed to read email template:', templatePath, error);
    throw new Error('Failed to load email template');
  }
}
