import { Resend } from 'resend';

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
    ? '🎉 歡迎加入 Harry Chang Studio 等候名單'
    : '🎉 Welcome to Harry Chang Studio Waitlist';

  const htmlContent = isZhTw ? getChineseEmailTemplate(displayName, position) : getEnglishEmailTemplate(displayName, position);

  try {
    const data = await resend.emails.send({
      from: 'Harry Chang Studio <studio@harrychang.me>',
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

function getEnglishEmailTemplate(displayName: string, position: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Harry Chang Studio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                You're In! 🎉
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.5);">
                Welcome to Harry Chang Studio
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Hi <strong style="color: #ffffff;">${displayName}</strong>,
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Thank you for joining the waitlist! You're <strong style="color: #ffffff;">position #${position}</strong> in line.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Harry Chang Studio is launching in <strong style="color: #ffffff;">Q2 2026</strong>. You'll be among the first to receive:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
                <li style="margin-bottom: 8px;">Early bird pricing and exclusive perks</li>
                <li style="margin-bottom: 8px;">Priority access to cohorts and sessions</li>
                <li style="margin-bottom: 8px;">Behind-the-scenes updates on curriculum development</li>
              </ul>

              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                We'll be in touch as we get closer to launch. In the meantime, feel free to reply to this email if you have any questions!
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://studio.harrychang.me" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Visit Studio
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); background-color: rgba(255, 255, 255, 0.02);">
              <p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                Harry Chang Studio · harrychang.me
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                You received this email because you joined our waitlist.<br>
                Questions? Reply to this email anytime.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function getChineseEmailTemplate(displayName: string, position: number): string {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>歡迎加入 Harry Chang Studio</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', 'Segoe UI', sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #111111; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                預約成功！ 🎉
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.5);">
                歡迎加入 Harry Chang Studio
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                嗨 <strong style="color: #ffffff;">${displayName}</strong>，
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                感謝您加入等候名單！您是第 <strong style="color: #ffffff;">${position}</strong> 位預約的會員。
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Harry Chang Studio 預計於 <strong style="color: #ffffff;">2026 Q2</strong> 正式啟動。您將優先獲得：
              </p>

              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
                <li style="margin-bottom: 8px;">早鳥優惠與限定福利</li>
                <li style="margin-bottom: 8px;">優先報名權與課程席位</li>
                <li style="margin-bottom: 8px;">課程開發進度與幕後花絮</li>
              </ul>

              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                接近上線時，我們會再次通知您。如果您有任何問題，歡迎直接回覆這封信！
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://studio.harrychang.me" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      前往 Studio
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); background-color: rgba(255, 255, 255, 0.02);">
              <p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                Harry Chang Studio · harrychang.me
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                您收到此郵件是因為您加入了我們的等候名單。<br>
                有任何問題歡迎隨時回覆此郵件。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
