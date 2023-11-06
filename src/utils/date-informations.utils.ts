import { IDateInformations } from 'src/interfaces/date-information.interface';

export function DateInformations(): IDateInformations {
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
