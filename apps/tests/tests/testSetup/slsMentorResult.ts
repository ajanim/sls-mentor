import { readFileSync } from 'fs';
import keyBy from 'lodash/keyBy';
import { ChecksResults } from '../../../../packages/sls-mentor/src/types';

export const slsMentorResult = keyBy(
  JSON.parse(
    readFileSync('./tests/slsMentorOutput.json', 'utf8'),
  ) as ChecksResults,
  'rule.ruleName',
);
