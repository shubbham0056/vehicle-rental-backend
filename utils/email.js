const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, name, token) => {
  const link = `${process.env.CLIENT_URL}/verify.html?token=${token}`;

  await transporter.sendMail({
    from: `"RentWheels" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your RentWheels account",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Welcome to RentWheels, ${name}!</h2>
        <p style="color:#64748b;margin-bottom:24px;">Please verify your email address to activate your account.</p>
        <a href="${link}"
          style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Verify Email Address
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px;">
          This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color:#cbd5e1;font-size:12px;margin-top:8px;">
          Or copy this link: <a href="${link}" style="color:#2563eb;">${link}</a>
        </p>
      </div>`,
  });
};

const sendPasswordResetEmail = async (toEmail, name, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

  await transporter.sendMail({
    from: `"RentWheels" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your RentWheels password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Password reset request</h2>
        <p style="color:#64748b;margin-bottom:24px;">Hi ${name}, we received a request to reset your RentWheels password.</p>
        <a href="${link}"
          style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
        </p>
        <p style="color:#cbd5e1;font-size:12px;margin-top:8px;">
          Or copy this link: <a href="${link}" style="color:#2563eb;">${link}</a>
        </p>
      </div>`,
  });
};

const sendPaymentLinkEmail = async (toEmail, name, vehicleName, amount, bookingId) => {
  const link = `${process.env.CLIENT_URL}/payment.html?bookingId=${bookingId}`;

  await transporter.sendMail({
    from: `"RentWheels" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your booking is approved — Complete your payment",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:8px;">Booking Approved! 🎉</h2>
        <p style="color:#64748b;margin-bottom:8px;">Hi ${name}, your booking for <strong>${vehicleName}</strong> has been approved.</p>
        <p style="color:#64748b;margin-bottom:24px;">Please complete your payment of <strong>₹${amount}</strong> to confirm your booking.</p>
        <a href="${link}"
          style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Pay Now ₹${amount}
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px;">This link is valid for your booking. If you did not make this booking, please ignore this email.</p>
      </div>`,
  });
};

const sendPaymentConfirmationEmail = async (toEmail, name, vehicleName, amount, paymentId) => {
  await transporter.sendMail({
    from: `"RentWheels" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Payment Confirmed — RentWheels",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#16a34a;margin-bottom:8px;">Payment Successful! ✅</h2>
        <p style="color:#64748b;margin-bottom:8px;">Hi ${name}, your payment for <strong>${vehicleName}</strong> has been confirmed.</p>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Amount Paid</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">₹${amount}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Payment ID: ${paymentId}</p>
        </div>
        <p style="color:#64748b;font-size:13px;">Your booking is now complete. Enjoy your ride!</p>
      </div>`,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendPaymentLinkEmail, sendPaymentConfirmationEmail };
