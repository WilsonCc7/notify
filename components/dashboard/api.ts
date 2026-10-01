// Every /api/tasks failure carries { error }. One place to read it so rows, form and
// shell all surface the server's message instead of a generic one.
export async function apiError(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  return data?.error || fallback;
}
