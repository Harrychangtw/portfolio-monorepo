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
    ? '🎉 歡迎加入 Icarus Lab by Harry Chang 等候名單'
    : '🎉 Welcome to Icarus Lab by Harry Chang Waitlist';

  const htmlContent = isZhTw ? getChineseEmailTemplate(displayName, position) : getEnglishEmailTemplate(displayName, position);

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

function getEnglishEmailTemplate(displayName: string, position: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF--8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Icarus Lab</title>
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
                Ready for Flight.
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.5);">
                Welcome to Icarus Lab
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
                Thank you for joining the waitlist. You're position <strong style="color: #ffffff;">#${position}</strong> in line to <em>build your wings</em>.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Icarus Lab is launching in <strong style="color: #ffffff;">Q2 2026</strong>. As an early member, you'll be the first to receive:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
                <li style="margin-bottom: 8px;">Early access pricing and exclusive perks</li>
                <li style="margin-bottom: 8px;">Priority enrollment in cohorts and sessions</li>
                <li style="margin-bottom: 8px;">Behind-the-scenes updates on our journey</li>
              </ul>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                They tell the story of Icarus as a warning. We see it as a dare.<br><br>
                Icarus Lab is for those who would rather <em>fly too close to the sun</em> than never leave the ground. The ones who build their own <em>wings</em> from ambition and code, knowing the <em>risk</em> is the point.<br><br>
                And now, you’re one of us.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); background-color: rgba(255, 255, 255, 0.02);">
              <p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                Icarus Lab · <a href="https://harrychang.me" style="color: #D8F600; text-decoration: none;">harrychang.me</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                You received this email because you dared to join our waitlist.<br>
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
  <title>歡迎加入 Icarus Lab </title>
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
                準備啟航
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.5);">
                歡迎加入 Icarus Lab
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
                感謝您加入等候名單。您是第 <strong style="color: #ffffff;">${position}</strong> 位準備<em>打造雙翼</em>的成員。
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Icarus Lab 預計於 <strong style="color: #ffffff;">2026 Q2</strong> 正式啟動。您將優先獲得：
              </p>

              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 16px; line-height: 1.8; color: rgba(255, 255, 255, 0.8);">
                <li style="margin-bottom: 8px;">早鳥限定優惠與福利</li>
                <li style="margin-bottom: 8px;">優先課程席位與報名權</li>
                <li style="margin-bottom: 8px;">內容開發進度與幕後花絮</li>
              </ul>

              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
                Icarus 的故事，常被當作一則警語。但在這裡，我們聽見的是喝采。<br><br>
               	Icarus Lab，是為那些寧願<em>飛得離太陽更近</em>，也不願終身停留地面的人而設。我們用創意與膽識打造自己的<em>雙翼</em>，並深知<em>風險</em>本身就是意義所在。<br><br>
                從今天起，你已是其中一員。
              </p>
              
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); background-color: rgba(255, 255, 255, 0.02);">
              <p style="margin: 0 0 12px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                Icarus lab · <a href="https://harrychang.me" style="color: #D8F600; text-decoration: none;">harrychang.me</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                您收到此郵件是因為您勇於加入我們的等候名單。<br>
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

