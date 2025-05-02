export function getTally(dailyCheckIns?: Record<string, { total: number }>): number {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  const tally = dailyCheckIns?.[`${yyyy}-${mm}-${dd}`]?.total || 0;
  return tally;
}
