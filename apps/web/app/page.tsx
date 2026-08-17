import { API_PREFIX, PRODUCT } from '@flaha/inspect-api-client';

export default function HomePage() {
  return (
    <main>
      <h1>{PRODUCT}</h1>
      <p>Manager dashboard scaffold (PR-01). Auth and map land in PR-14.</p>
      <p>API prefix: {API_PREFIX}</p>
    </main>
  );
}
