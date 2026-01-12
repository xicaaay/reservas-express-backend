import sgMail from '@sendgrid/mail';

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

/**
 * Servicio de envío de correos usando SendGrid API (HTTP).
 * No usa SMTP.
 * No bloquea el checkout.
 * Compatible con Railway.
 */
export class MailService {
  private static initialized = false;

  /**
   * Inicializa SendGrid una sola vez
   */
  private static init() {
    if (!this.initialized) {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY is not defined');
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.initialized = true;
    }
  }

  /**
   * Envía un correo con reintentos.
   * No lanza error al caller si todos los intentos fallan.
   */
  static async sendMailWithRetry(
    options: SendMailOptions,
    maxRetries = 3,
    delayMs = 1000,
  ): Promise<void> {
    this.init();

    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await sgMail.send({
          to: options.to,
          from: {
            email: process.env.MAIL_FROM ?? 'no-reply@em6824.indevelop.net',
            name: 'Reservas Express',
          },
          subject: options.subject,
          html: options.html,
          attachments: options.attachments?.map((att) => ({
            filename: att.filename,
            type: att.contentType ?? 'application/pdf',
            disposition: 'attachment',
            content: att.content.toString('base64'),
          })),
        });

        // Envío exitoso
        return;
      } catch (error) {
        attempt++;

        console.error(
          `SendGrid email failed (attempt ${attempt}/${maxRetries})`,
          error,
        );

        if (attempt >= maxRetries) {
          console.error(
            'Max email retry attempts reached. Email not sent.',
          );
          return;
        }

        // Esperar antes de reintentar
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs),
        );
      }
    }
  }
}
