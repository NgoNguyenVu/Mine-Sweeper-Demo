export function formatTime(time) {
    return new Date(time * 1000).toISOString().slice(14, 19);
  }
  