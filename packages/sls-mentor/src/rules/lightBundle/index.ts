import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { fetchAllLambdaConfigurations } from '../../aws-sdk-helpers';
import { SlsMentorLevel } from '../../constants/level';
import { Category, Rule } from '../../types';

const hasHeavyBundle = (lambdaConfiguration: FunctionConfiguration) =>
  lambdaConfiguration.CodeSize !== undefined &&
  lambdaConfiguration.CodeSize > 5000000;

const run: Rule['run'] = async resourceArns => {
  const lambdaConfigurations = await fetchAllLambdaConfigurations(resourceArns);
  const results = lambdaConfigurations.map(({ arn, configuration }) => ({
    arn,
    success: !hasHeavyBundle(configuration),
    bundleSize: configuration.CodeSize,
  }));

  return { results };
};

const rule: Rule = {
  ruleName: 'Lambda: Light Bundle',
  errorMessage:
    'The following functions have bundles that weight more than 5 Mb',
  run,
  fileName: 'lightBundle',
  categories: [Category.GREEN_IT, Category.STABILITY],
  level: SlsMentorLevel.Level4,
};

export default rule;
