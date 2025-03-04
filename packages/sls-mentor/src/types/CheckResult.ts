import { CustomARN } from './arn';
import { Category, Rule, RuleCheckResult } from './Rule';

export type ChecksResults = {
  rule: Rule;
  result: RuleCheckResult[];
}[];

export type FailedRule = {
  rule: Rule;
  extras: Record<string, unknown>;
};

export type ResourceResult = {
  resourceArn: CustomARN;
  failedRules: FailedRule[];
};

export type ChecksResultsByCategory = Record<Category, number>;

export const LOW_SCORE_THRESHOLD = 50;
export const MEDIUM_SCORE_THRESHOLD = 75;
