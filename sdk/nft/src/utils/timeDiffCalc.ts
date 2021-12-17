const timeDiffCalc = (diff: number) => {
  let diffInMilliSeconds = Math.abs(diff) / 1000;

  // calculate days
  const days = Math.floor(diffInMilliSeconds / 86400);
  diffInMilliSeconds -= days * 86400;

  // calculate hours
  const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
  diffInMilliSeconds -= hours * 3600;

  // calculate minutes
  const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
  diffInMilliSeconds -= minutes * 60;

  let difference = '';
  if (days > 0) {
    difference += days < 10 ? `0${days}d ` : `${days}d `;
  }

  difference += hours < 10 ? `0${hours}h ` : `${hours}h `;

  difference += minutes < 10 ? `0${minutes}m` : `${minutes}m`;

  return difference;
};

export default timeDiffCalc;
