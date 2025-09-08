const oneHourMs = 60 * 60 * 1000;

export const mergeDateAndTime = (
  date: Date | undefined,
  time: string,
): Date | undefined => {
  if (!date) return undefined;

  const [hours, minutes, seconds] = time.split(':').map(Number);
  const merged = new Date(date);

  merged.setHours(hours);
  merged.setMinutes(minutes);
  merged.setSeconds(seconds);

  return merged;
};

export const getMsFromInterval = (interval: string | undefined) => {
  switch (interval) {
    case '4h': {
      return 4 * oneHourMs;
    }
    case '8h': {
      return 8 * oneHourMs;
    }
    case '12h': {
      return 12 * oneHourMs;
    }
    case '24h': {
      return 24 * oneHourMs;
    }
    default: {
      return undefined;
    }
  }
};

export const getMsFromDuration = (
  duration: string | undefined,
  date?: Date,
  time?: string,
) => {
  switch (duration) {
    case '1d': {
      return 1 * 24 * oneHourMs;
    }
    case '5d': {
      return 5 * 24 * oneHourMs;
    }
    case '7d': {
      return 7 * 24 * oneHourMs;
    }
    case '30d': {
      return 30 * 24 * oneHourMs;
    }
    case 'custom': {
      if (!date || !time) return 0;
      const customDate = mergeDateAndTime(date, time);
      if (!customDate) return 0;
      return customDate.getTime() - Date.now();
    }
    default: {
      return undefined;
    }
  }
};
