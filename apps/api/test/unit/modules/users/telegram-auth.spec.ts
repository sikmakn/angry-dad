import { TelegramAuthService } from '../../../../src/modules/users/services/telegram-auth.service';
import { AppConfigService } from '../../../../src/config/app-config.service';
import { ConfigService } from '@nestjs/config';
import { authorization } from '../../../helpers/backend';

describe('Telegram initData trust boundary', () => {
  const auth = new TelegramAuthService(new AppConfigService(new ConfigService({ TELEGRAM_BOT_TOKEN: '123456:synthetic-test-token' })));
  it('accepts a correctly signed identity', () => expect(auth.verify(authorization(42))).toMatchObject({ id: 42 }));
  it.each([undefined, '', 'Bearer x', 'tma hash=oops', authorization(42).replace('Synthetic', 'Tampered')])('rejects absent, malformed or tampered credentials %s', (header) => {
    expect(() => auth.verify(header)).toThrow();
  });
  it('rejects duplicate signed parameters', () => expect(() => auth.verify(`${authorization(42)}&user=%7B%22id%22%3A42%7D`)).toThrow());
  it.each(['0', '-1', '1.5', '"42"', '9007199254740992', 'null'])('rejects invalid Telegram ID %s even with valid HMAC', (id) => {
    expect(() => auth.verify(authorization(42, { user: `{"id":${id}}` }))).toThrow();
  });
  it.each([-31, 3601])('rejects out-of-window auth_date (age %i)', (age) => {
    jest.spyOn(Date, 'now').mockReturnValue(1800000000000);
    try {
      expect(() => auth.verify(authorization(42, { auth_date: String(1800000000 - age) }))).toThrow();
    } finally {
      jest.restoreAllMocks();
    }
  });
  it.each([-30, 0, 3600])('accepts boundary age %i', (age) => {
    jest.spyOn(Date, 'now').mockReturnValue(1800000000000);
    try {
      expect(auth.verify(authorization(42, { auth_date: String(1800000000 - age) })).id).toBe(42);
    } finally {
      jest.restoreAllMocks();
    }
  });
});
