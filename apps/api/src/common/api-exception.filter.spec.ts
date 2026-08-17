import { BadRequestException } from '@nestjs/common';
import { ApiException } from './api-exception';
import { ApiExceptionFilter } from './api-exception.filter';
import { ErrorCode } from './errors';

function mockHost(res: { status: jest.Mock; json: jest.Mock }) {
  return {
    switchToHttp: () => ({
      getResponse: () => res,
    }),
  };
}

describe('ApiExceptionFilter', () => {
  it('passes through catalog-shaped ApiException bodies', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const filter = new ApiExceptionFilter();
    filter.catch(
      new ApiException(ErrorCode.ACCOUNT_LOCKED),
      mockHost({ status, json }) as never,
    );
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'ACCOUNT_LOCKED',
        message: 'Try again in 15 minutes',
      },
    });
  });

  it('maps Nest validation failures to VALIDATION_ERROR', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const filter = new ApiExceptionFilter();
    filter.catch(
      new BadRequestException({ message: ['email must be an email'] }),
      mockHost({ status, json }) as never,
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0][0].error.code).toBe('VALIDATION_ERROR');
  });
});
