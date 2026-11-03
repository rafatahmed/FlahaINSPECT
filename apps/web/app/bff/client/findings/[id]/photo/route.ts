import { rejectIfNotUuid } from '@/lib/bff';
import { streamApiImage } from '@/lib/upstream-media';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return rejectIfNotUuid(id) ?? streamApiImage(`/client/findings/${id}/photo`);
}
