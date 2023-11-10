import { utils, write, writeFile } from 'xlsx';
import { join } from 'path';
import { readdir, unlink } from 'fs';
import { createTransport } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IDateInformations } from 'src/interfaces/date-information.interface';
import { DateInformations } from 'src/utils/date-informations.utils';

@Injectable()
export class TasksService {
  private date: IDateInformations;

  constructor(private readonly configService: ConfigService) {
    this.date = DateInformations();
  }

  async JsonToXlsx(json: Array<any>): Promise<void> {
    const worksheet = utils.json_to_sheet(json);
    const workbook = utils.book_new();

    utils.book_append_sheet(workbook, worksheet, `${this.date.currentDay}`);

    write(workbook, { bookType: 'xlsx', type: 'buffer' });
    write(workbook, { bookType: 'xlsx', type: 'binary' });

    await writeFile(
      workbook,
      `files/relatorio-geral-de-cupons-${this.date.currentDay}.xlsx`,
    );
  }

  async sendEmail(): Promise<void> {
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
      subject: `Suporte | Leo Madeiras | Relatório geral de cupons - ${this.date.currentDay}`,
      html: `<p> Bom dia prezados, </p> Segue em anexo relatório geral de cupons referente ao chamado #13133362. </p> <p> Atenciosamente, </p>`,
      text: `Bom dia prezados, </p> Segue em anexo relatório geral de cupons referente ao chamado #13133362. Atenciosamente,`,
      attachments: [
        {
          filename: `relatorio-geral-de-cupons-${this.date.currentDay}.xlsx`,
          path:
            process.cwd() +
            `/files/relatorio-geral-de-cupons-${this.date.currentDay}.xlsx`,
          cid: `uniq-relatorio-geral-de-cupons-${this.date.currentDay}.xlsx`,
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
