import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { AWS_HISTORICAL_MAX_MEMORY } from '../../constants';
import { fetchAllLambdaConfigurations } from '../../helpers';
import { Rule } from '../../types';

const hasMemoryUnderMaxMemory = (lambdaConfiguration: FunctionConfiguration) =>
  lambdaConfiguration.MemorySize === undefined ||
  lambdaConfiguration.MemorySize < AWS_HISTORICAL_MAX_MEMORY;

const run: Rule['run'] = async resourceArns => {
  const lambdaConfigurations = await fetchAllLambdaConfigurations(resourceArns);

  const results = lambdaConfigurations.map(lambdaConfiguration => ({
    arn: lambdaConfiguration.FunctionArn ?? '',
    success: hasMemoryUnderMaxMemory(lambdaConfiguration),
    memorySize: lambdaConfiguration.MemorySize,
  }));

  return { results };
};

const rule: Rule = {
  ruleName: 'Lambda: Under Maximum Memory',
  errorMessage: `The function's memory is set to the historical maximum limit of ${AWS_HISTORICAL_MAX_MEMORY} MB or higher.\nSee (https://github.com/Kumo-by-Theodo/guardian/blob/master/docs/rules/under-max-memory.md) for impact and how to resolve.`,
  run,
};

export default rule;
