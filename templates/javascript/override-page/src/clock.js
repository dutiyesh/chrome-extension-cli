'use strict';

function getCurrentTime() {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let time = '';
  time += hours;
  time += ':';
  time += minutes < 10 ? '0' + minutes : minutes;

  return time;
}

export default getCurrentTime;
