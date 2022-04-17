'use strict';

function getCurrentTime(): string {
  const date: Date = new Date();
  const hours: number = date.getHours();
  const minutes: number = date.getMinutes();

  let time: string = '';
  time += hours;
  time += ':';
  time += minutes < 10 ? '0' + minutes : minutes;

  return time;
}

export default getCurrentTime;
