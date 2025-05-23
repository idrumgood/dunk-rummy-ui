export const formatDisplayDate = (isoDateString: string): string => {
  if (!isoDateString) return 'Date not available';
  try {
    return new Date(isoDateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid date';
  }
};
