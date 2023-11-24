import * as dotenv from 'dotenv';

dotenv.config();

export default {
  MONGODB_COLLECTION: process.env.MONGODB_COLLECTION,
  MONGODB_URL: process.env.MONGODB_URL,
  OCC_URL: process.env.OCC_URL,
  OCC_APP_KEY: process.env.OCC_APP_KEY,
  PORT: process.env.PORT,
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
  MAIL_TO: process.env.MAIL_TO,
  CRON_REPORT: process.env.CRON_REPORT,
  CRON_CURRENT_ORDERS: process.env.CRON_CURRENT_ORDERS,
};
