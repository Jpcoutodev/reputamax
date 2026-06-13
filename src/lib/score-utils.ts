/** Funções de score compartilhadas entre Server e Client Components. */

export function scoreColor(score: number): string {
  if (score >= 80) return "var(--success)";
  if (score >= 50) return "var(--warning)";
  return "var(--danger)";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Reputação saudável";
  if (score >= 50) return "Reputação com potencial desperdiçado";
  return "Reputação em risco";
}
