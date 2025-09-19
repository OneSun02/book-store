import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?email=${email}&code=${code}`;

  await transporter.sendMail({
    from: `"ONE SHOP" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Mã xác thực email",
    html: `
      <p>Chào bạn,</p>
      <p>Mã xác thực của bạn là: <b>${code}</b></p>
      <p>Mã có hiệu lực 10 phút.</p>
    `,
  });
}
