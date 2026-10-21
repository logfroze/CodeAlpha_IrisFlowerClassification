import irisDataJson from './irisData.json';

export interface IrisSample {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
  target: number;
  species: 'setosa' | 'versicolor' | 'virginica';
}

export const IRIS_SAMPLES: IrisSample[] = irisDataJson.samples as IrisSample[];
export const IRIS_STATISTICS = irisDataJson.describe as Record<string, Record<string, number>>;
export const IRIS_CORRELATION = irisDataJson.corr as Record<string, Record<string, number>>;

export const PRESET_SPECIMENS: { name: string; species: string; desc: string; values: [number, number, number, number] }[] = [
  {
    name: 'Typical Setosa',
    species: 'setosa',
    desc: 'Small petals (< 2cm), wide sepals',
    values: [5.1, 3.5, 1.4, 0.2],
  },
  {
    name: 'Typical Versicolor',
    species: 'versicolor',
    desc: 'Intermediate petal length & width',
    values: [5.9, 3.0, 4.2, 1.5],
  },
  {
    name: 'Typical Virginica',
    species: 'virginica',
    desc: 'Large petals (> 5cm length, > 1.8cm width)',
    values: [6.7, 3.3, 5.7, 2.1],
  },
  {
    name: 'Boundary Decision Case',
    species: 'versicolor / virginica',
    desc: 'Near decision frontier (petal length 4.8cm)',
    values: [6.0, 2.9, 4.8, 1.8],
  },
];
