import { utils, write, writeFile } from 'xlsx';
import { join } from 'path';
import { readdir, unlink } from 'fs';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IDateInformations } from 'src/interfaces/date-information.interface';

@Injectable()
export class TasksService {
  constructor(private readonly configService: ConfigService) {}

  DateInformations(): IDateInformations {
    const currentDay = new Date();
    const lastDay = new Date();

    lastDay.setDate(currentDay.getDate() - 1);

    const currentDayFormatted = currentDay.toISOString().slice(0, 10);
    const lastDayFormatted = lastDay.toISOString().slice(0, 10);

    const date: IDateInformations = {
      currentDay: currentDayFormatted,
      lastDay: lastDayFormatted,
    };

    return date;
  }

  async JsonToXlsx(json: Array<any>): Promise<void> {
    const date = this.DateInformations();

    const worksheet = utils.json_to_sheet(json);
    const workbook = utils.book_new();

    utils.book_append_sheet(workbook, worksheet, `${date.currentDay}`);

    write(workbook, { bookType: 'xlsx', type: 'buffer' });
    write(workbook, { bookType: 'xlsx', type: 'binary' });

    await writeFile(
      workbook,
      `files/relatorio-geral-de-cupons-${date.currentDay}.xlsx`,
    );
  }

  async sendEmail(): Promise<void> {
    const date = this.DateInformations();

    const transport = createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: Number(this.configService.get('MAIL_PORT')),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });

    await transport.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: this.configService.get('MAIL_TO'),
      subject: `Suporte | Leo Madeiras | Relatório geral de cupons - ${date.currentDay}`,
      html: `<p> Bom dia prezados, </p> Segue em anexo relatório geral de cupons referente ao chamado #13133362. </p> <p> Atenciosamente, </p>`,
      text: `Bom dia prezados, </p> Segue em anexo relatório geral de cupons referente ao chamado #13133362. Atenciosamente,`,
      attachments: [
        {
          filename: `relatorio-geral-de-cupons-${date.currentDay}.xlsx`,
          path:
            process.cwd() +
            `/files/relatorio-geral-de-cupons-${date.currentDay}.xlsx`,
          cid: `uniq-relatorio-geral-de-cupons-${date.currentDay}.xlsx`,
        },
      ],
    });
  }

  deleteFiles(): void {
    readdir('files', (err, files) => {
      if (err) {
        throw new Error(`Error reading files.`);
      }

      // Itera sobre cada arquivo na pasta
      files.forEach((file) => {
        const filePath = join('files', file);

        // Remove o arquivo
        unlink(filePath, (err) => {
          if (err) {
            throw new Error(`Error unlink filePath.`);
          }
        });
      });
    });
  }
}
