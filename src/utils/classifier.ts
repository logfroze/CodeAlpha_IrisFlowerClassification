/**
 * Client-side inference and input validation engine for Iris Flower Classification.
 * Encapsulates the exact StandardScaler parameters and LogisticRegression weights
 * from the serialized model artifact (`models/iris_classifier.joblib`).
 */

export interface FlowerInput {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
}

export type IrisSpecies = 'setosa' | 'versicolor' | 'virginica';

export interface PredictionResult {
  predictedClass: number;
  species: IrisSpecies;
  displayName: string;
  probabilities: {
    setosa: number;
    versicolor: number;
    virginica: number;
  };
  confidence: number;
  zScores: number[];
  modelName: string;
}

export const TARGET_SPECIES: IrisSpecies[] = ['setosa', 'versicolor', 'virginica'];

export const FEATURE_BOUNDS = {
  sepal_length: { min: 1.0, max: 15.0, label: 'Sepal Length', unit: 'cm' },
  sepal_width: { min: 1.0, max: 10.0, label: 'Sepal Width', unit: 'cm' },
  petal_length: { min: 0.5, max: 15.0, label: 'Petal Length', unit: 'cm' },
  petal_width: { min: 0.05, max: 10.0, label: 'Petal Width', unit: 'cm' },
} as const;

// Serialized parameters from fitted Scikit-learn Pipeline (seed 42)
export const MODEL_WEIGHTS = {
  modelName: 'Logistic Regression (Pipeline)',
  scaler: {
    mean: [5.841666666666667, 3.048333333333333, 3.77, 1.205],
    scale: [0.8374150039788449, 0.44665111913239647, 1.7611359970201053, 0.7594789880788891],
  },
  classifier: {
    coef: [
      [-1.0889449397829571, 1.0242076281023333, -1.7990560892687026, -1.6862281947599056], // Setosa
      [0.5363365389098398, -0.36048698211755004, -0.20407418434232835, -0.8079570305810982], // Versicolor
      [0.5526084008731174, -0.6637206459847838, 2.003130273611031, 2.4941852253410035],   // Virginica
    ],
    intercept: [-0.30558672176868484, 1.9085555441430444, -1.6029688223743603],
  },
};

/**
 * Validates botanical feature measurements.
 * Throws an Error with a descriptive message if invalid.
 */
export function validateFlowerInput(input: Partial<FlowerInput>): FlowerInput {
  const keys: (keyof FlowerInput)[] = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];

  for (const key of keys) {
    const val = input[key];
    const bound = FEATURE_BOUNDS[key];

    if (val === undefined || val === null || isNaN(val)) {
      throw new Error(`Feature '${bound.label}' must be a valid numeric measurement.`);
    }

    if (val <= 0) {
      throw new Error(`Feature '${bound.label}' must be strictly positive (> 0 cm).`);
    }

    if (val < bound.min || val > bound.max) {
      throw new Error(
        `Feature '${bound.label}' (${val} cm) is outside plausible botanical bounds [${bound.min}, ${bound.max}] cm.`
      );
    }
  }

  return {
    sepal_length: Number(input.sepal_length),
    sepal_width: Number(input.sepal_width),
    petal_length: Number(input.petal_length),
    petal_width: Number(input.petal_width),
  };
}

/**
 * Computes species prediction and calibrated class probabilities using Softmax regression.
 */
export function predictFlowerSpecies(rawInput: Partial<FlowerInput>): PredictionResult {
  const input = validateFlowerInput(rawInput);
  const rawVector = [input.sepal_length, input.sepal_width, input.petal_length, input.petal_width];

  // 1. Standardize features: z = (x - mean) / scale
  const zScores = rawVector.map((val, idx) => {
    return (val - MODEL_WEIGHTS.scaler.mean[idx]) / MODEL_WEIGHTS.scaler.scale[idx];
  });

  // 2. Compute logits for each of the 3 classes: logit_k = intercept_k + sum(coef_k,j * z_j)
  const logits = MODEL_WEIGHTS.classifier.coef.map((classCoefs, classIdx) => {
    const dotProduct = classCoefs.reduce((sum, weight, j) => sum + weight * zScores[j], 0);
    return MODEL_WEIGHTS.classifier.intercept[classIdx] + dotProduct;
  });

  // 3. Compute stable Softmax probabilities: p_k = exp(logit_k - max_logit) / sum(exp)
  const maxLogit = Math.max(...logits);
  const expLogits = logits.map((l) => Math.exp(l - maxLogit));
  const expSum = expLogits.reduce((acc, curr) => acc + curr, 0);
  const probs = expLogits.map((e) => e / expSum);

  // 4. Select champion class (argmax)
  let bestClassIdx = 0;
  let highestProb = -1;
  probs.forEach((p, idx) => {
    if (p > highestProb) {
      highestProb = p;
      bestClassIdx = idx;
    }
  });

  const predictedSpecies = TARGET_SPECIES[bestClassIdx];
  const displayNames: Record<IrisSpecies, string> = {
    setosa: 'Iris setosa',
    versicolor: 'Iris versicolor',
    virginica: 'Iris virginica',
  };

  return {
    predictedClass: bestClassIdx,
    species: predictedSpecies,
    displayName: displayNames[predictedSpecies],
    probabilities: {
      setosa: Number(probs[0].toFixed(4)),
      versicolor: Number(probs[1].toFixed(4)),
      virginica: Number(probs[2].toFixed(4)),
    },
    confidence: Number((highestProb * 100).toFixed(1)),
    zScores,
    modelName: MODEL_WEIGHTS.modelName,
  };
}
