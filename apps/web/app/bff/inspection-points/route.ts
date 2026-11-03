import { jsonWithoutSecrets } from '@/lib/bff';
import { stripSignedMedia } from '@/lib/report-ui';
import { upstream } from '@/lib/upstream';

export async function GET(req: Request) {
  const qs = new URL(req.url).search;
  const { status, json } = await upstream('GET', `/inspection-points${qs}`);
  return jsonWithoutSecrets(stripSignedMedia(json), status);
}
