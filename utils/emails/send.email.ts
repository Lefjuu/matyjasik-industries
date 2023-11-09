import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { EmailTemplates } from "./templates.email";
import { User, EmailService } from "./types.email";

export class Email implements EmailService {
    private to: string;
    private from: string;
    private transporter: Transporter<SendMailOptions>;

    constructor(user: User) {
        this.to = user.email;
        this.from = `Lefju <${process.env.EMAIL_FROM || ""}>`;
        this.transporter = this.createTransporter();
    }

    private createTransporter(): Transporter<SendMailOptions> {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "",
            port: parseInt(process.env.EMAIL_PORT || "0", 10),
            auth: {
                user: process.env.EMAIL_USERNAME || "",
                pass: process.env.EMAIL_PASSWORD || "",
            },
        });
    }

    async send(subject: string, html: string): Promise<void> {
        const mailOptions: SendMailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendVerificationToken(username: string, url: string): Promise<void> {
        const emailContent = EmailTemplates.verifyAccount(username, url);
        await this.send("Welcome to the Matyjasik App!", emailContent);
    }

    async sendPasswordReset(username: string, url: string): Promise<void> {
        const emailContent = EmailTemplates.resetPassword(username, url);
        await this.send(
            "Your password reset token (valid for only 10 minutes)",
            emailContent,
        );
    }
}
