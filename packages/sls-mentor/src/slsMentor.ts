import { runChecks } from './checks';
import { readConfiguration } from './configuration/utils/readConfiguration';
import {
  displayChecksStarting,
  displayDashboard,
  displayError,
  displayFailedChecksDetails,
  displayGuordle,
  displayResultsSummary,
} from './display';
import { fetchAllResourceArns, initAccountAndRegion } from './init';
import { getResultsByCategory } from './results/getResultsByCategory';

import { ChecksResults, CustomARN, Options } from './types';
import { getSlsMentorLevel } from './utils/getSlsMentorLevel';

export const runSlsMentor = async (
  options: Options,
): Promise<{ success: boolean; checksResults?: ChecksResults }> => {
  const configuration = readConfiguration();
  const level = await getSlsMentorLevel(options);

  displayChecksStarting();

  await initAccountAndRegion();

  let allResourcesArns: CustomARN[];
  try {
    allResourcesArns = await fetchAllResourceArns({
      cloudformationStacks:
        options.cloudformationStacks ?? options.cloudformations,
      tags: options.tags,
    });
  } catch {
    const profile = process.env.AWS_PROFILE;
    if (profile !== undefined) {
      displayError(
        `Unable to fetch AWS resources, check that profile "${profile}" is correctly set and has the needed rights or specify another profile using -p option`,
      );

      return { success: false };
    }

    displayError(
      `Unable to fetch AWS resources, check that your default profile is correctly set and has the needed rights or that you have correctly set environment variables`,
    );

    return { success: false };
  }

  const checksResults = await runChecks(
    allResourcesArns,
    level,
    configuration.rules,
  );

  const atLeastOneFailed = checksResults.some(
    ({ result }) => result.filter(resource => !resource.success).length > 0,
  );

  if (!options.short && atLeastOneFailed) {
    displayFailedChecksDetails(checksResults);
  }

  displayResultsSummary(checksResults);
  const resultsByCategory = getResultsByCategory(checksResults);
  displayDashboard(resultsByCategory);
  displayGuordle(resultsByCategory);

  return {
    success: options.noFail || !atLeastOneFailed,
    ...(options.getJsonResults === true ? { checksResults } : {}),
  };
};
