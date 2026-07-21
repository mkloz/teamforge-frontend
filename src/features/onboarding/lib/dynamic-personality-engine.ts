import {
  DYNAMIC_PERSONALITY_PACKAGE,
  DYNAMIC_PERSONALITY_PACKAGE_HASH,
} from "@/features/onboarding/data/dynamic-personality-package.generated";

export type DynamicDimension = "O" | "C" | "E" | "A" | "N";
export type DynamicResponseValue = 1 | 2 | 3 | 4 | 5;
export type DynamicStopReason = "MAXIMUM_REACHED" | "PRECISION_REACHED";

export type DynamicPersonalityItem =
  (typeof DYNAMIC_PERSONALITY_PACKAGE.items)[number];

export interface DynamicAssessmentPage {
  pageNumber: number;
  itemVersionIds: string[];
}

export interface DynamicTraitEstimate {
  theta: number;
  posteriorSd: number;
  score: number;
  lower90: number;
  upper90: number;
}

export type DynamicTraitEstimates = Record<
  DynamicDimension,
  DynamicTraitEstimate
>;

export interface DynamicResponseQuality {
  longestSameResponseRun: number;
  neutralResponseRate: number;
  responseVariance: number;
}

export interface DynamicAssessmentState {
  answers: Record<string, DynamicResponseValue>;
  currentPage: DynamicAssessmentPage;
  estimates: DynamicTraitEstimates | null;
  pages: DynamicAssessmentPage[];
  responseQuality: DynamicResponseQuality | null;
  seed: string;
  status: "IN_PROGRESS" | "READY_TO_SUBMIT";
  stopReason: DynamicStopReason | null;
}

interface TraitPosterior extends DynamicTraitEstimate {
  weights: number[];
}

type TraitPosteriors = Record<DynamicDimension, TraitPosterior>;

const DIMENSIONS: DynamicDimension[] = ["O", "C", "E", "A", "N"];
const ITEMS_BY_ID = new Map<string, DynamicPersonalityItem>(
  DYNAMIC_PERSONALITY_PACKAGE.items.map((item) => [item.itemVersionId, item]),
);
const ITEMS_BY_DIMENSION: Record<DynamicDimension, DynamicPersonalityItem[]> = {
  A: DYNAMIC_PERSONALITY_PACKAGE.items.filter((item) => item.dimension === "A"),
  C: DYNAMIC_PERSONALITY_PACKAGE.items.filter((item) => item.dimension === "C"),
  E: DYNAMIC_PERSONALITY_PACKAGE.items.filter((item) => item.dimension === "E"),
  N: DYNAMIC_PERSONALITY_PACKAGE.items.filter((item) => item.dimension === "N"),
  O: DYNAMIC_PERSONALITY_PACKAGE.items.filter((item) => item.dimension === "O"),
};
const THETA_GRID = buildThetaGrid();

validatePackage();

export const DYNAMIC_ASSESSMENT_PACKAGE_ID =
  DYNAMIC_PERSONALITY_PACKAGE.packageId;
export const DYNAMIC_ASSESSMENT_MANIFEST_HASH =
  DYNAMIC_PERSONALITY_PACKAGE_HASH;
export const DYNAMIC_ASSESSMENT_POLICY = DYNAMIC_PERSONALITY_PACKAGE.policy;

export function initializeDynamicAssessment(
  seed: string,
): DynamicAssessmentState {
  if (!seed.trim()) {
    throw new DynamicAssessmentError("A selection seed is required.");
  }

  const firstPage = buildCorePage(1, seed);

  return {
    answers: {},
    currentPage: firstPage,
    estimates: null,
    pages: [firstPage],
    responseQuality: null,
    seed,
    status: "IN_PROGRESS",
    stopReason: null,
  };
}

export function advanceDynamicAssessment(
  state: DynamicAssessmentState,
  pageAnswers: Record<string, DynamicResponseValue>,
): DynamicAssessmentState {
  if (state.status !== "IN_PROGRESS") {
    throw new DynamicAssessmentError("This assessment is already complete.");
  }

  assertCompletePageAnswers(state.currentPage, pageAnswers);

  const answers = { ...state.answers, ...pageAnswers };
  const posteriors = estimateTraits(answers);
  const estimates = toPublicEstimates(posteriors);
  const answeredPages = state.pages.length;
  const responseQuality = calculateResponseQuality(state.pages, answers);
  const reachedMinimum =
    answeredPages >= DYNAMIC_PERSONALITY_PACKAGE.policy.minimumPages;
  const precisionReached =
    reachedMinimum &&
    DIMENSIONS.every(
      (dimension) =>
        posteriors[dimension].posteriorSd <=
        DYNAMIC_PERSONALITY_PACKAGE.policy.posteriorSdTarget,
    );
  const maximumReached =
    answeredPages >= DYNAMIC_PERSONALITY_PACKAGE.policy.maximumPages;

  if (precisionReached || maximumReached) {
    return {
      ...state,
      answers,
      estimates,
      responseQuality,
      status: "READY_TO_SUBMIT",
      stopReason: precisionReached ? "PRECISION_REACHED" : "MAXIMUM_REACHED",
    };
  }

  const nextPageNumber = answeredPages + 1;
  const nextPage =
    nextPageNumber <= DYNAMIC_PERSONALITY_PACKAGE.policy.minimumPages
      ? buildCorePage(nextPageNumber, state.seed)
      : buildAdaptivePage(nextPageNumber, state.seed, answers, posteriors);

  return {
    ...state,
    answers,
    currentPage: nextPage,
    estimates,
    pages: [...state.pages, nextPage],
    responseQuality,
  };
}

export function getDynamicPageItems(page: DynamicAssessmentPage) {
  return page.itemVersionIds.map((itemVersionId) => {
    const item = ITEMS_BY_ID.get(itemVersionId);

    if (!item) {
      throw new DynamicAssessmentError(
        `Package item ${itemVersionId} is unavailable.`,
      );
    }

    return item;
  });
}

export function getDynamicAssessmentResult(state: DynamicAssessmentState) {
  if (
    state.status !== "READY_TO_SUBMIT" ||
    !state.estimates ||
    !state.stopReason ||
    !state.responseQuality
  ) {
    throw new DynamicAssessmentError("The assessment is not ready to submit.");
  }

  const ocean = {
    openness: state.estimates.O.score,
    conscientiousness: state.estimates.C.score,
    extraversion: state.estimates.E.score,
    agreeableness: state.estimates.A.score,
    neuroticism: state.estimates.N.score,
  };

  return {
    ocean,
    personalityType: derivePersonalityType(state.estimates),
    measurement: {
      mode: "DYNAMIC" as const,
      questionCount: Object.keys(state.answers).length,
      stopReason: state.stopReason,
      uncertainty: {
        openness: toTraitUncertainty(state.estimates.O),
        conscientiousness: toTraitUncertainty(state.estimates.C),
        extraversion: toTraitUncertainty(state.estimates.E),
        agreeableness: toTraitUncertainty(state.estimates.A),
        neuroticism: toTraitUncertainty(state.estimates.N),
      },
      responseQuality: state.responseQuality,
    },
  };
}

export function replayDynamicAssessment(input: {
  answers: Array<{ itemVersionId: string; value: DynamicResponseValue }>;
  pages: DynamicAssessmentPage[];
  seed: string;
}) {
  const answerById = new Map(
    input.answers.map((answer) => [answer.itemVersionId, answer.value]),
  );
  let state = initializeDynamicAssessment(input.seed);

  for (const submittedPage of input.pages) {
    assertPageMatches(state.currentPage, submittedPage);
    const pageAnswers = Object.fromEntries(
      submittedPage.itemVersionIds.map((itemVersionId) => {
        const value = answerById.get(itemVersionId);

        if (value === undefined) {
          throw new DynamicAssessmentError(
            `No answer was provided for ${itemVersionId}.`,
          );
        }

        return [itemVersionId, value];
      }),
    );
    state = advanceDynamicAssessment(state, pageAnswers);
  }

  if (state.status !== "READY_TO_SUBMIT") {
    throw new DynamicAssessmentError(
      "The submitted path ended before a valid stopping point.",
    );
  }

  if (input.answers.length !== Object.keys(state.answers).length) {
    throw new DynamicAssessmentError(
      "The submission contains answers outside the replayed path.",
    );
  }

  return { state, result: getDynamicAssessmentResult(state) };
}

function buildCorePage(pageNumber: number, seed: string) {
  const coreIndex = pageNumber - 1;
  const itemVersionIds = DIMENSIONS.map(
    (dimension) =>
      DYNAMIC_PERSONALITY_PACKAGE.coreItemIdsByTrait[dimension][coreIndex],
  );

  if (itemVersionIds.some((itemVersionId) => !itemVersionId)) {
    throw new DynamicAssessmentError("The common core is incomplete.");
  }

  return {
    pageNumber,
    itemVersionIds: deterministicOrder(itemVersionIds, seed, pageNumber),
  };
}

function buildAdaptivePage(
  pageNumber: number,
  seed: string,
  answers: Record<string, DynamicResponseValue>,
  posteriors: TraitPosteriors,
) {
  const itemVersionIds = DIMENSIONS.map((dimension) => {
    const eligibleItems = ITEMS_BY_DIMENSION[dimension].filter(
      (item) => answers[item.itemVersionId] === undefined && item.active,
    );

    if (!eligibleItems.length) {
      throw new DynamicAssessmentError(
        `No eligible ${dimension} item remains for page ${pageNumber}.`,
      );
    }

    return selectMaximumInformationItem(
      eligibleItems,
      posteriors[dimension].weights,
      seed,
      pageNumber,
    ).itemVersionId;
  });

  return {
    pageNumber,
    itemVersionIds: deterministicOrder(itemVersionIds, seed, pageNumber),
  };
}

function selectMaximumInformationItem(
  items: DynamicPersonalityItem[],
  posteriorWeights: number[],
  seed: string,
  pageNumber: number,
) {
  return items
    .map((item) => ({
      item,
      expectedInformation: expectedItemInformation(item, posteriorWeights),
      tieBreaker: stableHash(`${seed}:${pageNumber}:${item.itemVersionId}`),
    }))
    .sort(
      (left, right) =>
        right.expectedInformation - left.expectedInformation ||
        left.tieBreaker - right.tieBreaker ||
        left.item.itemVersionId.localeCompare(right.item.itemVersionId),
    )[0].item;
}

function estimateTraits(
  answers: Record<string, DynamicResponseValue>,
): TraitPosteriors {
  return {
    A: estimateTrait("A", answers),
    C: estimateTrait("C", answers),
    E: estimateTrait("E", answers),
    N: estimateTrait("N", answers),
    O: estimateTrait("O", answers),
  };
}

function estimateTrait(
  dimension: DynamicDimension,
  answers: Record<string, DynamicResponseValue>,
): TraitPosterior {
  const administered = ITEMS_BY_DIMENSION[dimension].filter(
    (item) => answers[item.itemVersionId] !== undefined,
  );
  const logWeights = THETA_GRID.map((theta) => -0.5 * theta * theta);

  for (const item of administered) {
    const rawResponse = answers[item.itemVersionId];

    if (!rawResponse) {
      continue;
    }

    const orientedResponse = item.positiveKeyed
      ? rawResponse
      : reverseResponse(rawResponse);

    THETA_GRID.forEach((theta, index) => {
      const probability = categoryProbabilities(item, theta)[
        orientedResponse - 1
      ];
      logWeights[index] += Math.log(Math.max(probability, 1e-12));
    });
  }

  const maximumLogWeight = Math.max(...logWeights);
  const weights = logWeights.map((value) => Math.exp(value - maximumLogWeight));
  normalizeWeights(weights);

  const theta = weightedSum(weights, THETA_GRID);
  const secondMoment = weightedSum(
    weights,
    THETA_GRID.map((value) => value * value),
  );
  const posteriorSd = Math.sqrt(Math.max(0, secondMoment - theta * theta));
  const scoreCurve = buildExpectedScoreCurve(dimension);
  const score = weightedSum(weights, scoreCurve);
  const lowerThetaIndex = quantileIndex(weights, 0.05);
  const upperThetaIndex = quantileIndex(weights, 0.95);

  return {
    lower90: roundScore(scoreCurve[lowerThetaIndex]),
    posteriorSd: roundPrecision(posteriorSd),
    score: roundScore(score),
    theta: roundPrecision(theta),
    upper90: roundScore(scoreCurve[upperThetaIndex]),
    weights,
  };
}

function buildExpectedScoreCurve(dimension: DynamicDimension) {
  const items = ITEMS_BY_DIMENSION[dimension];

  return THETA_GRID.map((theta) => {
    const expectedTotal = items.reduce((sum, item) => {
      const probabilities = categoryProbabilities(item, theta);
      const expectedResponse = probabilities.reduce(
        (itemSum, probability, index) => itemSum + probability * (index + 1),
        0,
      );

      return sum + expectedResponse;
    }, 0);

    return ((expectedTotal / items.length - 1) / 4) * 100;
  });
}

function expectedItemInformation(
  item: DynamicPersonalityItem,
  posteriorWeights: number[],
) {
  return THETA_GRID.reduce((sum, theta, index) => {
    const step = 0.0001;
    const probability = categoryProbabilities(item, theta);
    const probabilityAbove = categoryProbabilities(item, theta + step);
    const probabilityBelow = categoryProbabilities(item, theta - step);
    const information = probability.reduce((itemSum, value, category) => {
      const derivative =
        (probabilityAbove[category] - probabilityBelow[category]) / (2 * step);

      return itemSum + (derivative * derivative) / Math.max(value, 1e-12);
    }, 0);

    return sum + posteriorWeights[index] * information;
  }, 0);
}

function categoryProbabilities(item: DynamicPersonalityItem, theta: number) {
  const cumulative = item.thresholds.map(
    (threshold) =>
      1 / (1 + Math.exp(-item.discrimination * (theta - threshold))),
  );

  return [
    1 - cumulative[0],
    cumulative[0] - cumulative[1],
    cumulative[1] - cumulative[2],
    cumulative[2] - cumulative[3],
    cumulative[3],
  ];
}

function calculateResponseQuality(
  pages: DynamicAssessmentPage[],
  answers: Record<string, DynamicResponseValue>,
): DynamicResponseQuality {
  const orderedValues = pages
    .flatMap((page) => page.itemVersionIds)
    .map((itemVersionId) => answers[itemVersionId])
    .filter((value): value is DynamicResponseValue => value !== undefined);
  const mean =
    orderedValues.reduce((sum, value) => sum + value, 0) / orderedValues.length;
  const responseVariance =
    orderedValues.reduce(
      (sum, value) => sum + (value - mean) * (value - mean),
      0,
    ) / orderedValues.length;

  let longestSameResponseRun = 0;
  let currentRun = 0;
  let previous: DynamicResponseValue | undefined;

  for (const value of orderedValues) {
    currentRun = value === previous ? currentRun + 1 : 1;
    longestSameResponseRun = Math.max(longestSameResponseRun, currentRun);
    previous = value;
  }

  return {
    longestSameResponseRun,
    neutralResponseRate: roundPrecision(
      orderedValues.filter((value) => value === 3).length /
        orderedValues.length,
    ),
    responseVariance: roundPrecision(responseVariance),
  };
}

function toPublicEstimates(posteriors: TraitPosteriors): DynamicTraitEstimates {
  return {
    A: withoutPosteriorWeights(posteriors.A),
    C: withoutPosteriorWeights(posteriors.C),
    E: withoutPosteriorWeights(posteriors.E),
    N: withoutPosteriorWeights(posteriors.N),
    O: withoutPosteriorWeights(posteriors.O),
  };
}

function withoutPosteriorWeights({
  weights: _weights,
  ...estimate
}: TraitPosterior): DynamicTraitEstimate {
  return estimate;
}

function reverseResponse(value: DynamicResponseValue): DynamicResponseValue {
  switch (value) {
    case 1:
      return 5;
    case 2:
      return 4;
    case 3:
      return 3;
    case 4:
      return 2;
    case 5:
      return 1;
    default:
      throw new DynamicAssessmentError("The response value is invalid.");
  }
}

function derivePersonalityType(estimates: DynamicTraitEstimates) {
  return `${estimates.E.score > 50 ? "E" : "I"}${
    estimates.O.score > 50 ? "N" : "S"
  }${estimates.A.score > 50 ? "F" : "T"}${estimates.C.score > 50 ? "J" : "P"}`;
}

function toTraitUncertainty(estimate: DynamicTraitEstimate) {
  return {
    lower90: estimate.lower90,
    posteriorSd: estimate.posteriorSd,
    upper90: estimate.upper90,
  };
}

function assertCompletePageAnswers(
  page: DynamicAssessmentPage,
  answers: Record<string, DynamicResponseValue>,
) {
  const answerIds = Object.keys(answers).sort();
  const expectedIds = [...page.itemVersionIds].sort();

  if (
    answerIds.length !== expectedIds.length ||
    answerIds.some(
      (itemVersionId, index) => itemVersionId !== expectedIds[index],
    )
  ) {
    throw new DynamicAssessmentError(
      "Submit exactly one answer for every item on the current page.",
    );
  }

  if (
    Object.values(answers).some(
      (value) => !Number.isInteger(value) || value < 1 || value > 5,
    )
  ) {
    throw new DynamicAssessmentError("Every response must be between 1 and 5.");
  }
}

function assertPageMatches(
  expected: DynamicAssessmentPage,
  submitted: DynamicAssessmentPage,
) {
  if (
    submitted.pageNumber !== expected.pageNumber ||
    submitted.itemVersionIds.length !== expected.itemVersionIds.length ||
    submitted.itemVersionIds.some(
      (itemVersionId, index) =>
        itemVersionId !== expected.itemVersionIds[index],
    )
  ) {
    throw new DynamicAssessmentError(
      `Submitted page ${submitted.pageNumber} does not match the replayed path.`,
    );
  }
}

function deterministicOrder(
  itemVersionIds: readonly string[],
  seed: string,
  pageNumber: number,
) {
  return [...itemVersionIds].sort(
    (left, right) =>
      stableHash(`${seed}:${pageNumber}:order:${left}`) -
        stableHash(`${seed}:${pageNumber}:order:${right}`) ||
      left.localeCompare(right),
  );
}

function stableHash(value: string) {
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

function normalizeWeights(weights: number[]) {
  const total = weights.reduce((sum, value) => sum + value, 0);

  if (!Number.isFinite(total) || total <= 0) {
    throw new DynamicAssessmentError("The posterior could not be estimated.");
  }

  weights.forEach((value, index) => {
    weights[index] = value / total;
  });
}

function weightedSum(weights: number[], values: number[]) {
  return weights.reduce(
    (sum, weight, index) => sum + weight * values[index],
    0,
  );
}

function quantileIndex(weights: number[], quantile: number) {
  let cumulative = 0;

  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index];

    if (cumulative >= quantile) {
      return index;
    }
  }

  return weights.length - 1;
}

function buildThetaGrid() {
  const values: number[] = [];
  const { thetaMinimum, thetaMaximum, thetaStep } =
    DYNAMIC_PERSONALITY_PACKAGE.estimator;

  for (
    let theta = thetaMinimum;
    theta <= thetaMaximum + thetaStep / 2;
    theta += thetaStep
  ) {
    values.push(Number(theta.toFixed(10)));
  }

  return values;
}

function roundScore(value: number) {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function roundPrecision(value: number) {
  return Number(value.toFixed(6));
}

function validatePackage() {
  if (
    DYNAMIC_PERSONALITY_PACKAGE.items.length !==
    DYNAMIC_PERSONALITY_PACKAGE.policy.maximumQuestions
  ) {
    throw new DynamicAssessmentError(
      "The Dynamic item bank does not match its maximum length.",
    );
  }

  const uniqueIds = new Set(
    DYNAMIC_PERSONALITY_PACKAGE.items.map((item) => item.itemVersionId),
  );

  if (uniqueIds.size !== DYNAMIC_PERSONALITY_PACKAGE.items.length) {
    throw new DynamicAssessmentError("Dynamic item IDs must be unique.");
  }

  for (const item of DYNAMIC_PERSONALITY_PACKAGE.items) {
    if (
      item.thresholds.length !== 4 ||
      item.thresholds.some(
        (threshold, index) =>
          index > 0 && threshold <= item.thresholds[index - 1],
      ) ||
      item.discrimination <= 0
    ) {
      throw new DynamicAssessmentError(
        `Invalid graded-response parameters for ${item.itemVersionId}.`,
      );
    }
  }

  for (const dimension of DIMENSIONS) {
    if (
      DYNAMIC_PERSONALITY_PACKAGE.coreItemIdsByTrait[dimension].length !==
      DYNAMIC_PERSONALITY_PACKAGE.policy.minimumDirectItemsPerTrait
    ) {
      throw new DynamicAssessmentError(
        `The ${dimension} common core is incomplete.`,
      );
    }
  }
}

export class DynamicAssessmentError extends Error {}
