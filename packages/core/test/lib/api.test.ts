/* eslint-disable deprecation/deprecation */
import { makeDsn } from '@sentry/utils';

import { getEnvelopeEndpointWithUrlEncodedAuth, getReportDialogEndpoint } from '../../src/api';

const ingestDsn = 'https://abc@xxxx.ingest.sentry.io:1234/subpath/123';
const dsnPublic = 'https://abc@sentry.io:1234/subpath/123';
const tunnel = 'https://hello.com/world';

const dsnPublicComponents = makeDsn(dsnPublic);

describe('API', () => {
  test('getEnvelopeEndpoint', () => {
    expect(getEnvelopeEndpointWithUrlEncodedAuth(dsnPublicComponents)).toEqual(
      'https://sentry.io:1234/subpath/api/123/envelope/?sentry_key=abc&sentry_version=7',
    );
    expect(getEnvelopeEndpointWithUrlEncodedAuth(dsnPublicComponents, tunnel)).toEqual(tunnel);
  });

  describe('getReportDialogEndpoint', () => {
    test.each([
      [
        'with Ingest DSN',
        ingestDsn,
        {},
        'https://xxxx.ingest.sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@xxxx.ingest.sentry.io:1234/subpath/123',
      ],
      [
        'with Public DSN',
        dsnPublic,
        {},
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123',
      ],
      [
        'with Public DSN and dynamic options',
        dsnPublic,
        { eventId: 'abc', testy: '2' },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123&eventId=abc&testy=2',
      ],
      [
        'with Public DSN, dynamic options and user name and email',
        dsnPublic,
        {
          eventId: 'abc',
          user: {
            email: 'email',
            name: 'yo',
          },
        },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123&eventId=abc&name=yo&email=email',
      ],
      [
        'with Public DSN and user name',
        dsnPublic,
        {
          user: {
            name: 'yo',
          },
        },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123&name=yo',
      ],
      [
        'with Public DSN and user email',
        dsnPublic,
        {
          user: {
            email: 'email',
          },
        },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123&email=email',
      ],
      [
        'with Public DSN, dynamic options and undefined user',
        dsnPublic,
        {
          eventId: 'abc',
          user: undefined,
        },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123&eventId=abc',
      ],
      [
        'with Public DSN and undefined user',
        dsnPublic,
        { user: undefined },
        'https://sentry.io:1234/subpath/api/embed/error-page/?dsn=https://abc@sentry.io:1234/subpath/123',
      ],
    ])(
      '%s',
      (
        _: string,
        dsn: Parameters<typeof getReportDialogEndpoint>[0],
        options: Parameters<typeof getReportDialogEndpoint>[1],
        output: ReturnType<typeof getReportDialogEndpoint>,
      ) => {
        expect(getReportDialogEndpoint(dsn, options)).toBe(output);
      },
    );
  });
});
