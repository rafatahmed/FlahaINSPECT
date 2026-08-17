import {
  HTTP_DURATION,
  JOB_DEAD_LETTERS,
  PHOTO_BYTES,
  SYNC_LAG,
  TUS_POST_FINISH,
  TUS_PRE_CREATE,
  recordHttp,
  recordPhotoBytes,
  recordSyncLag,
  recordTus,
  renderPrometheus,
  resetMetrics,
  setGauge,
} from './registry';

describe('metrics registry', () => {
  beforeEach(() => {
    resetMetrics();
  });

  it('exposes the TDD Observability names', () => {
    recordHttp('GET', '/v1/projects', 200, 0.02);
    recordTus('pre_create', 'ok');
    recordTus('post_finish', 'error');
    recordPhotoBytes(2048);
    recordSyncLag(12);
    setGauge(JOB_DEAD_LETTERS, 'Jobs in dead status', 3);

    const text = renderPrometheus();
    expect(text).toContain(`# TYPE ${HTTP_DURATION} histogram`);
    expect(text).toContain(`# TYPE ${TUS_PRE_CREATE} counter`);
    expect(text).toContain(`# TYPE ${TUS_POST_FINISH} counter`);
    expect(text).toContain(`# TYPE ${PHOTO_BYTES} counter`);
    expect(text).toContain(`# TYPE ${SYNC_LAG} histogram`);
    expect(text).toContain(`# TYPE ${JOB_DEAD_LETTERS} gauge`);
    expect(text).toContain('tus_pre_create_total{result="ok"} 1');
    expect(text).toContain('tus_post_finish_total{result="error"} 1');
    expect(text).toContain('photo_bytes_uploaded 2048');
    expect(text).toContain('job_dead_letters 3');
    expect(text).toContain('http_request_duration_seconds_count{method="GET",route="/v1/projects",status="200"} 1');
  });

  it('does not explode label values', () => {
    recordHttp('GET', '/v1/projects', 200, 0.01);
    expect(renderPrometheus()).not.toMatch(/route="\/v1\/projects\/[0-9a-f-]{8}/);
  });
});
