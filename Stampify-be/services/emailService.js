const nodemailer = require('nodemailer');

/**
 * Send reward email to customer
 */
const sendRewardEmail = async (customerEmail, customerName, businessName, rewardText) => {
    try {
        // For development, use console log
        // In production, configure SMTP settings
        if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
            const transporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@stampify.com',
                to: customerEmail,
                subject: `🎉 Congratulations! You've earned a reward from ${businessName}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Congratulations${customerName ? ', ' + customerName : ''}!</h1>
            <p style="font-size: 16px;">You've completed your stamp card at <strong>${businessName}</strong>!</p>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1F2937; margin-top: 0;">Your Reward:</h2>
              <p style="font-size: 18px; color: #4F46E5; font-weight: bold;">${rewardText}</p>
            </div>
            <p>Visit ${businessName} to claim your reward!</p>
            <p style="color: #6B7280; font-size: 14px;">Thank you for being a loyal customer!</p>
          </div>
        `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Reward email sent to ${customerEmail}`);
        } else {
            // Development mode - just log
            console.log('=== REWARD EMAIL (DEV MODE) ===');
            console.log(`To: ${customerEmail}`);
            console.log(`Subject: Congratulations! You've earned a reward from ${businessName}`);
            console.log(`Reward: ${rewardText}`);
            console.log('================================');
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending reward email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendRewardEmail
};
