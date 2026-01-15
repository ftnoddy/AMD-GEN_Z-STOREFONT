
import nodemailer from "nodemailer";

class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, 
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  public async sendEmail(mailOptions: { to: string; subject: string; html: string }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Support Team" <${process.env.EMAIL_USER}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });

      console.log(` Email sent to ${mailOptions.to}`);
    } catch (error) {
      console.error(" Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }
}

export default MailService;
