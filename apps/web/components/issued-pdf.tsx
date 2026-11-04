'use client';
import { useState } from 'react';
export function IssuedPdf({ id }: { id: string }) {
  const url = `/bff/client/reports/${id}/file`;
  const [error, setError] = useState('');
  async function download() {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error();
      const object = URL.createObjectURL(await r.blob());
      const a = document.createElement('a');
      a.href = object;
      a.download = `issued-report-${id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(object), 60000);
    } catch {
      setError('Could not download this report.');
    }
  }
  return (
    <>
      <a href={url} target="_blank" rel="noopener">
        View PDF
      </a>{' '}
      <button onClick={() => void download()}>Download</button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
