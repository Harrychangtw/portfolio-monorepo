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
  position: number;
  locale: string;
}

export async function sendWaitlistConfirmationEmail({
  email,
  firstName,
  lastName,
  position,
  locale
}: SendWaitlistConfirmationParams) {
  const displayName = firstName 
    ? `${firstName}${lastName ? ' ' + lastName : ''}`
    : email.split('@')[0];

  const isZhTw = locale === 'zh-TW';

  const subject = isZhTw 
    ? '🎉 歡迎加入 Icarus Lab by Harry Chang 等候名單'
    : '🎉 Welcome to Icarus Lab by Harry Chang Waitlist';

  const htmlContent = getEmailTemplate(displayName, position, locale);

  try {
    const data = await resend.emails.send({
      from: 'Harry Chang Lab <lab@harrychang.me>',
      to: [email],
      subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

function getEmailTemplate(displayName: string, position: number, locale: string): string {
  const isZhTw = locale === 'zh-TW';
  const templateFileName = isZhTw 
    ? 'waitlist-confirmation-zh-tw.html' 
    : 'waitlist-confirmation-en.html';
  
  const templatePath = path.join(process.cwd(), 'lib', 'email-templates', templateFileName);
  
  try {
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders with actual values
    template = template.replace(/\{\{displayName\}\}/g, displayName);
    template = template.replace(/\{\{position\}\}/g, position.toString());
    
    return template;
  } catch (error) {
    console.error('Failed to read email template:', templatePath, error);
    throw new Error('Failed to load email template');
  }
}

