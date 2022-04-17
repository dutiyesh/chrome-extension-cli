const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function getDay() {
  const day = new Date().getDay();

  return DAYS[day];
}

export default getDay;
