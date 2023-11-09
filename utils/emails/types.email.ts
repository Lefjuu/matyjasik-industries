export interface User {
    email: string;
}

export interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export type TransportOptions = {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
};

export interface EmailService {
    sendVerificationToken(username: string, url: string): Promise<void>;
    sendPasswordReset(username: string, url: string): Promise<void>;
}
