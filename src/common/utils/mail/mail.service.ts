import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

export class MailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  /**
   * Envía un correo con reintentos automáticos.
   * No lanza error al caller si todos los intentos fallan.
   */
  static async sendMailWithRetry(
    options: SendMailOptions,
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<void> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await this.transporter.sendMail({
          from: '"Reservas Express" <no-reply@em6824.indevelop.net>',
          to: options.to,
          subject: options.subject,
          html: options.html,
          attachments: options.attachments,
        });

        // Envío exitoso, se sale del loop
        return;
      } catch (error) {
        attempt++;

        console.error(
          `Email send failed (attempt ${attempt}/${maxRetries})`,
          error,
        );

        // Si ya se alcanzó el máximo de intentos, no se vuelve a lanzar error
        if (attempt >= maxRetries) {
          console.error(
            'Max email retry attempts reached. Email not sent.',
          );
          return;
        }

        // Esperar antes de reintentar
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
}
