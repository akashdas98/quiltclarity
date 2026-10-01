import type { OptimizerScoreWeights, PackedCandidate } from './types';

export const DEFAULT_SCORE_WEIGHTS: OptimizerScoreWeights = {
  usedLength: 1_000,
  waste: 100,
  cutComplexity: 10,
  fragmentation: 1,
};

export function scoreCandidate(
  candidate: Omit<PackedCandidate, 'candidateScore'>,
  usableWidth: number,
  weights: OptimizerScoreWeights,
): number {
  const normalizedUsedLength = candidate.usedLength / usableWidth;
  const layoutArea = usableWidth * candidate.usedLength;
  const normalizedWaste =
    layoutArea === 0 ? 0 : candidate.wasteArea / layoutArea;

  return (
    weights.usedLength * normalizedUsedLength +
    weights.waste * normalizedWaste +
    weights.cutComplexity * candidate.cutComplexity +
    weights.fragmentation * candidate.fragmentation
  );
}

export function comparePackedCandidates(
  left: PackedCandidate,
  right: PackedCandidate,
): number {
  if (left.candidateScore !== right.candidateScore) {
    return left.candidateScore - right.candidateScore;
  }
  if (left.usedLength !== right.usedLength) {
    return left.usedLength - right.usedLength;
  }
  if (left.cutComplexity !== right.cutComplexity) {
    return left.cutComplexity - right.cutComplexity;
  }
  if (left.wasteArea !== right.wasteArea) {
    return left.wasteArea - right.wasteArea;
  }

  return left.strategyIndex - right.strategyIndex;
}
