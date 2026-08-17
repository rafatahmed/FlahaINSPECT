import { routeLabel } from './http.interceptor';

describe('routeLabel', () => {
  it('prefers the Express route template', () => {
    expect(
      routeLabel({
        route: { path: '/v1/inspection-points/:id' },
        path: '/v1/inspection-points/11111111-1111-1111-1111-111111111111',
        originalUrl: '/v1/inspection-points/11111111-1111-1111-1111-111111111111',
      }),
    ).toBe('/v1/inspection-points/:id');
  });

  it('strips UUIDs when the template is missing', () => {
    expect(
      routeLabel({
        path: '/v1/reports/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        originalUrl: '/v1/reports/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      }),
    ).toBe('/v1/reports/:id');
  });
});
