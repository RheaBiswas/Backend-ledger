const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


async function sendRegistrationEmail(userEmail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetEmail(userEmail, name, token) {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    const subject = 'Password Reset Request - LedgerBook';
    const text = `Hello ${name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour. If you did not request this, please ignore this email.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p>
                  <p>You requested a password reset. Please click the link below to reset your password:</p>
                  <p><a href="${resetUrl}">${resetUrl}</a></p>
                  <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
                  <p>Best regards,<br>The Backend Ledger Team</p>`;

    console.log(`[EMAIL SEND] Reset password link for ${userEmail}: ${resetUrl}`);
    await sendEmail(userEmail, subject, text, html);
}

async function sendDebitNotification(userEmail, name, amount, fromAccount, toAccount, txId) {
    const subject = 'DEBIT ALERT - Account Debited';
    const text = `Hello ${name},\n\nYour bookkeeping account has been debited.\n\nTransaction details:\n- Source Account: ${fromAccount}\n- Destination Account: ${toAccount}\n- Amount Debited: ${amount} INR\n- Transaction ID: ${txId}\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p>
                  <h3>DEBIT ALERT: Funds Outflow</h3>
                  <p>Your bookkeeping account has been successfully debited.</p>
                  <table style="border-collapse: collapse; width: 100%; max-width: 500px; background: #fafafa; border: 1px solid #eee;">
                    <tr><td style="padding: 8px; font-weight: bold;">Source Account</td><td style="padding: 8px; font-family: monospace;">${fromAccount}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Destination Account</td><td style="padding: 8px; font-family: monospace;">${toAccount}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Amount</td><td style="padding: 8px; color: #ef4444; font-weight: bold;">-${amount} INR</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Transaction ID</td><td style="padding: 8px; font-family: monospace;">${txId}</td></tr>
                  </table>
                  <p style="margin-top: 15px;">Best regards,<br>The Backend Ledger Team</p>`;

    console.log(`[EMAIL SEND] Debit Alert to ${userEmail} for transaction ${txId}. Amount: ${amount}`);
    await sendEmail(userEmail, subject, text, html);
}

async function sendCreditNotification(userEmail, name, amount, fromAccount, toAccount, txId) {
    const subject = 'CREDIT ALERT - Account Credited';
    const text = `Hello ${name},\n\nYour bookkeeping account has been credited.\n\nTransaction details:\n- Source Account: ${fromAccount}\n- Destination Account: ${toAccount}\n- Amount Credited: ${amount} INR\n- Transaction ID: ${txId}\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p>
                  <h3>CREDIT ALERT: Funds Inflow</h3>
                  <p>Your bookkeeping account has been successfully credited.</p>
                  <table style="border-collapse: collapse; width: 100%; max-width: 500px; background: #fafafa; border: 1px solid #eee;">
                    <tr><td style="padding: 8px; font-weight: bold;">Source Account</td><td style="padding: 8px; font-family: monospace;">${fromAccount}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Destination Account</td><td style="padding: 8px; font-family: monospace;">${toAccount}</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Amount</td><td style="padding: 8px; color: #10b981; font-weight: bold;">+${amount} INR</td></tr>
                    <tr><td style="padding: 8px; font-weight: bold;">Transaction ID</td><td style="padding: 8px; font-family: monospace;">${txId}</td></tr>
                  </table>
                  <p style="margin-top: 15px;">Best regards,<br>The Backend Ledger Team</p>`;

    console.log(`[EMAIL SEND] Credit Alert to ${userEmail} for transaction ${txId}. Amount: ${amount}`);
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail,
    sendPasswordResetEmail,
    sendDebitNotification,
    sendCreditNotification
};