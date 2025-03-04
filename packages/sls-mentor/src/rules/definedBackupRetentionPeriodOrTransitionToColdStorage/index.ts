import { GetBackupPlanOutput } from '@aws-sdk/client-backup';
import { fetchAllBackupPlanConfigurations } from '../../aws-sdk-helpers';
import { SlsMentorLevel } from '../../constants/level';
import { Category, Rule } from '../../types';

const isRetentionPeriodOrTransitionToColdStorageDefinedForEachRule = (
  backupPlanConfiguration: GetBackupPlanOutput,
): boolean => {
  const rules = backupPlanConfiguration.BackupPlan?.Rules ?? [];

  return rules.reduce(
    (arePreviousRulesValid, rule) =>
      arePreviousRulesValid &&
      (rule.Lifecycle?.DeleteAfterDays !== undefined ||
        rule.Lifecycle?.MoveToColdStorageAfterDays !== undefined),
    true,
  );
};

const run: Rule['run'] = async resourceArns => {
  const backupPlans = await fetchAllBackupPlanConfigurations(resourceArns);
  const results = backupPlans.map(({ arn, configuration }) => ({
    arn,
    success:
      isRetentionPeriodOrTransitionToColdStorageDefinedForEachRule(
        configuration,
      ),
  }));

  return { results };
};

const rule: Rule = {
  ruleName:
    'Backup: Defined Backup Retention Period or Transition to Cold Storage',
  errorMessage:
    'The backup plan has at least one backup rule without defined retention period and transition to cold storage',
  run,
  fileName: 'definedBackupRetentionPeriodOrTransitionToColdStorage',
  categories: [Category.GREEN_IT, Category.IT_COSTS],
  level: SlsMentorLevel.Level3,
};

export default rule;
