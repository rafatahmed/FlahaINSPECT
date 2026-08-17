import { allowlistDeviceInfo, fieldPayloadEqual } from './field-payload';

const base = {
  projectId: 'p1',
  inspectorId: 'i1',
  category: 'defect',
  note: 'leak',
  latitude: 25.286112,
  longitude: 51.534901,
  accuracyM: 3.8,
  capturedAt: new Date('2026-08-07T07:12:33.000Z'),
  locationAdjusted: false,
  locationSource: 'phone_gps',
};

describe('fieldPayloadEqual', () => {
  it('treats a retry with the same field payload as equal', () => {
    expect(fieldPayloadEqual(base, { ...base })).toBe(true);
    expect(
      fieldPayloadEqual(base, { ...base, latitude: 25.2861124, longitude: 51.5349013 }),
    ).toBe(true);
  });

  it('rejects a different category or note on the same client_uuid', () => {
    expect(fieldPayloadEqual(base, { ...base, category: 'note' })).toBe(false);
    expect(fieldPayloadEqual(base, { ...base, note: 'other' })).toBe(false);
  });
});

describe('allowlistDeviceInfo', () => {
  it('keeps only allowlisted keys', () => {
    expect(
      allowlistDeviceInfo({
        platform: 'android',
        model: 'Pixel',
        evil: 'nope',
      }),
    ).toEqual({ platform: 'android', model: 'Pixel' });
  });
});
