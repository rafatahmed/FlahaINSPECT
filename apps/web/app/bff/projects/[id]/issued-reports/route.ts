import { upstream } from '@/lib/upstream';
import { jsonWithoutSecrets, rejectIfNotUuid } from '@/lib/bff';
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const invalid = rejectIfNotUuid(id);
  if (invalid) return invalid;
  const { status, json } = await upstream(
    'POST',
    `/projects/${id}/issued-reports`,
    await req.json().catch(() => ({})),
  );
  return jsonWithoutSecrets(json, status);
}
