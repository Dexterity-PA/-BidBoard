export type KnapsackItem = {
  scholarshipId: number;
  name: string;
  provider: string;
  evScore: number;        // dollars
  evPerHour: number;      // dollars per hour
  estimatedHours: number; // e.g. 0.5, 1.5, 3.5
  matchScore: number;
  localityLevel: string | null;
  deadline: string | null; // ISO "YYYY-MM-DD" or null
};

/**
 * 0/1 knapsack DP.
 * Hours are converted to half-hour integer slots (×2) so fractional hours
 * become integer weights. Budget of 40 hrs = 80 slots; 50 items × 80 slots
 * = 4,000 DP cells — runs in < 1 ms.
 *
 * Returns the optimal subset sorted by evScore descending (rank 1 = highest EV).
 */
export function solveKnapsack(
  items: KnapsackItem[],
  budgetHours: number
): KnapsackItem[] {
  const budgetSlots = Math.max(0, Math.round(budgetHours * 2)); // e.g. 15 hrs → 30 slots
  const n = items.length;

  // Integer weights: minimum 1 slot (30 min) to avoid degenerate zero-weight items
  const weights = items.map((item) => Math.max(1, Math.round(item.estimatedHours * 2)));
  // evPerHour is carried in KnapsackItem for UI display but intentionally not used by DP,
  // which optimizes evScore (dollars). evPerHour ranking only works for fractional knapsack.
  const values = items.map((item) => item.evScore);

  // 2D DP table: dp[i][j] = max EV using the first i items with j slots of budget
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(budgetSlots + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let j = 0; j <= budgetSlots; j++) {
      // Option A: skip item i
      dp[i][j] = dp[i - 1][j];
      // Option B: take item i (only if it fits)
      if (j >= w && dp[i - 1][j - w] + v > dp[i][j]) {
        dp[i][j] = dp[i - 1][j - w] + v;
      }
    }
  }

  // Traceback: walk from dp[n][budgetSlots] back to dp[0][0]
  const selected: KnapsackItem[] = [];
  let remaining = budgetSlots;
  for (let i = n; i >= 1; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      // Item i-1 was included in the optimal solution
      selected.push(items[i - 1]);
      remaining -= weights[i - 1];
    }
  }

  // Sort by evScore descending so rank 1 = highest EV
  return selected.sort((a, b) => b.evScore - a.evScore);
}
