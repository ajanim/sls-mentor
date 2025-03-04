import { FunctionConfiguration } from '@aws-sdk/client-lambda';
import { fetchAllLambdaConfigurations } from '../../aws-sdk-helpers';
import { SlsMentorLevel } from '../../constants/level';
import { Category, Rule } from '../../types';

const hasUniqueShaCode = (
  lambdaConfiguration: FunctionConfiguration,
  functionsArnGroupedByCodeSha: Record<string, string[]>,
): boolean => {
  const codeSha = lambdaConfiguration.CodeSha256 ?? '';

  return codeSha !== ''
    ? functionsArnGroupedByCodeSha[codeSha].length === 1
    : true;
};

const run: Rule['run'] = async resourceArns => {
  const lambdasConfigurations = await fetchAllLambdaConfigurations(
    resourceArns,
  );

  const functionsArnGroupedByCodeSha = lambdasConfigurations.reduce(
    (acc, { configuration }) => {
      const key = configuration.CodeSha256;
      const functionArn = configuration.FunctionArn;
      if (key === undefined || functionArn === undefined) {
        return acc;
      }
      if (!Object.keys(acc).includes(key)) {
        acc[key] = [];
      }
      acc[key].push(functionArn);

      return acc;
    },
    {} as Record<string, string[]>,
  );

  const results = lambdasConfigurations.map(({ arn, configuration }) => {
    const shaCode = configuration.CodeSha256 ?? '';
    const uniqueCode = hasUniqueShaCode(
      configuration,
      functionsArnGroupedByCodeSha,
    );
    const identicalCodeFunctions =
      shaCode !== '' && !uniqueCode
        ? functionsArnGroupedByCodeSha[shaCode]
        : '';

    return {
      arn,
      success: uniqueCode,
      identicalCodeFunctionsArn: identicalCodeFunctions,
    };
  });

  return { results };
};

const rule: Rule = {
  ruleName: 'Lambda: No Mono Package',
  errorMessage: 'The function code packaged with others',
  run,
  fileName: 'noMonoPackage',
  categories: [Category.STABILITY],
  level: SlsMentorLevel.Level1,
};

export default rule;
