export interface AnomalyResult {
  index: number;
  value: number;
  zScore: number;
  isAnomaly: boolean;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: number[], populationMean: number): number {
  if (values.length === 0) return 0;
  const variance = values.reduce((sum, v) => sum + (v - populationMean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function detectAnomalies(data: number[], sensitivity: number = 2): AnomalyResult[] {
  if (data.length === 0) return [];

  const validData = data.map((v) => (Number.isFinite(v) ? v : 0));
  const dataMean = mean(validData);
  const dataStdDev = standardDeviation(validData, dataMean);

  return validData.map((value, index) => {
    const zScore = dataStdDev === 0 ? 0 : (value - dataMean) / dataStdDev;
    return {
      index,
      value,
      zScore: Number(zScore.toFixed(4)),
      isAnomaly: Math.abs(zScore) > sensitivity,
    };
  });
}
