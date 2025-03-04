import { describe, expect, it } from 'vitest';
import UseArmRule from '../../../packages/sls-mentor/src/rules/useArm';
import { FAIL_ARM64_LAMBDA_NAME } from '../lib/failStack/lambda';
import { PASS_ARM64_LAMBDA_NAME } from '../lib/passStack/lambda';
import { slsMentorResult } from './testSetup/slsMentorResult';

const ruleName = UseArmRule['ruleName'];

const slsMentorOutput = slsMentorResult[ruleName];

describe('lambda-arm-64', () => {
  it('sls-mentor passes on lambda with ARM64 architecture ', () => {
    const { result } = slsMentorOutput;
    expect(
      result.find(r => r.arn.resource.includes(PASS_ARM64_LAMBDA_NAME))
        ?.success,
    ).toBe(true);
  });

  it('sls-mentor fails on lambda with X86 architecture', () => {
    const { result } = slsMentorOutput;
    expect(
      result.find(r => r.arn.resource.includes(FAIL_ARM64_LAMBDA_NAME))
        ?.success,
    ).toBe(false);
  });
});
