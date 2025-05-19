export const getStage = (tally: number, goal: number): number => {
  const stages = 20;
  if (!goal || tally <= 0) return 0;
  const ratio = tally / goal;
  const curr_stage = Math.min(stages - 1, Math.floor(ratio * stages));
  return curr_stage;
};
