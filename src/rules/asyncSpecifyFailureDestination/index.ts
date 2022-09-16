import { parse } from '@aws-sdk/util-arn-parser';
import {
  fetchAllAsyncLambdasArns,
  fetchAllLambdaInvokeEventConfigs,
} from '../../helpers';
import { Rule } from '../../types';

const run: Rule['run'] = async resourceArns => {
  const asyncLambdasArns = await fetchAllAsyncLambdasArns(resourceArns);

  const invokeConfigs = await fetchAllLambdaInvokeEventConfigs(
    asyncLambdasArns.map(parse),
  );

  const results = invokeConfigs.map(({ arn, config }) => ({
    arn,
    success: config?.DestinationConfig?.OnFailure?.Destination !== undefined,
  }));

  return { results };
};

const rule: Rule = {
  ruleName: 'Lambda: Specify Failure Destination for Async Functions',
  errorMessage:
    'The function is asynchronous but has no failure destination set. See (https://github.com/Kumo-by-Theodo/guardian/blob/master/docs/rules/async-specify-failure-destination.md) for impact and how to resolve.',
  run,
};

export default rule;
