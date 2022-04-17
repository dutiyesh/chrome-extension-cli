const DAYS: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function getDay(): string {
  const day: number = new Date().getDay();

  return DAYS[day];
}

export default getDay;
