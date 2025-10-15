import path from 'path';
import { readFile } from 'fs/promises';
import { format } from 'date-fns';
import { Resend } from 'resend';
import { AppConfig } from './config.js';
import { Lead } from './util.js';

export const sendLeadsEmail = async (
  leads: Lead[],
  csvPath: string,
  config: AppConfig
): Promise<void> => {
  const emailConfig = config.email;
  if (!emailConfig || !emailConfig.enabled) {
    return;
  }

  if (!emailConfig.apiKey || !emailConfig.from || emailConfig.to.length === 0) {
    console.warn('E-Mail-Konfiguration unvollständig, Versand übersprungen.');
    return;
  }

  const resend = new Resend(emailConfig.apiKey);

  const fileName = path.basename(csvPath);
  const summaryLines = [
    `Leads insgesamt: ${leads.length}`,
    `Erstellt am: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`
  ];

  const textBody = `Hallo,\n\n` +
    `anbei findest du die aktuelle CSV mit möglichen App-Leads. ` +
    `Kurze Zusammenfassung:\n${summaryLines.map((line) => `- ${line}`).join('\n')}\n\n` +
    `Viele Grüße\nApp Leads Scout`;

  const csvBuffer = await readFile(csvPath);

  const { error } = await resend.emails.send({
    from: emailConfig.from,
    to: emailConfig.to,
    subject: emailConfig.subject,
    text: textBody,
    attachments: [
      {
        filename: fileName,
        content: csvBuffer.toString('base64')
      }
    ]
  });

  if (error) {
    throw new Error(`Resend-Fehler: ${error.message}`);
  }

  console.log('E-Mail mit Leads versendet.');
};
