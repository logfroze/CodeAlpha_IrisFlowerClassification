import test from 'node:test';
import assert from 'node:assert/strict';
import {
  predictFlowerSpecies,
  validateFlowerInput,
  TARGET_SPECIES,
} from './classifier';

test('valid inputs return correct structured object', () => {
  const result = predictFlowerSpecies({
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
  });

  assert.equal(result.species, 'setosa');
  assert.equal(result.predictedClass, 0);
  assert.ok(result.probabilities.setosa > 0.95);
  assert.equal(result.displayName, 'Iris setosa');
  assert.ok(result.confidence > 90);
});

test('virginica specimen correctly classified with high confidence', () => {
  const result = predictFlowerSpecies({
    sepal_length: 6.7,
    sepal_width: 3.3,
    petal_length: 5.7,
    petal_width: 2.1,
  });

  assert.equal(result.species, 'virginica');
  assert.equal(result.predictedClass, 2);
  assert.ok(result.probabilities.virginica > 0.9);
});

test('versicolor specimen correctly classified', () => {
  const result = predictFlowerSpecies({
    sepal_length: 5.9,
    sepal_width: 3.0,
    petal_length: 4.2,
    petal_width: 1.5,
  });

  assert.equal(result.species, 'versicolor');
  assert.equal(result.predictedClass, 1);
  assert.ok(result.probabilities.versicolor > 0.5);
});

test('probabilities sum to approximately 1.0', () => {
  const result = predictFlowerSpecies({
    sepal_length: 6.0,
    sepal_width: 2.9,
    petal_length: 4.5,
    petal_width: 1.5,
  });

  const sum =
    result.probabilities.setosa +
    result.probabilities.versicolor +
    result.probabilities.virginica;
  assert.ok(Math.abs(sum - 1.0) < 0.01);
});

test('validation rejects non-positive values', () => {
  assert.throws(
    () => {
      validateFlowerInput({
        sepal_length: -5.0,
        sepal_width: 3.0,
        petal_length: 1.4,
        petal_width: 0.2,
      });
    },
    { message: /strictly positive/ }
  );
});

test('validation rejects out-of-bounds measurements', () => {
  assert.throws(
    () => {
      validateFlowerInput({
        sepal_length: 45.0,
        sepal_width: 3.0,
        petal_length: 1.4,
        petal_width: 0.2,
      });
    },
    { message: /outside plausible botanical bounds/ }
  );
});
