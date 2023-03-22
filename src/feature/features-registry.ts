import { FeatureMetadata } from './feature-metadata';
import { FeatureRule } from './feature-rule';
import { ShpToSldGeneratorConfig } from '../model/shp-to-sld-generator.config';
import { FeatureType } from '../model/feature-type';

export class FeaturesRegistry {
  private readonly byNames: { [name: string]: FeatureMetadata };
  private readonly byColors: { [name: string]: { [name: string]: boolean } };

  constructor() {
    this.byColors = {};
    this.byNames = {};
  }

  addFeature(featureMetadata: FeatureMetadata) {
    const name = featureMetadata.getName();
    const color = featureMetadata.getColor();
    if (this.byNames[name]) {
      this.byNames[name].merge(featureMetadata);
    } else {
      this.byNames[name] = featureMetadata;
    }
    if (featureMetadata.getType() !== FeatureType.OTHER) {
      this.byColors[color] = {
        ...(this.byColors[color] || {}),
        ...featureMetadata.getLineTypesMap()
      };
    }
  }

  getFeatureRules(config: ShpToSldGeneratorConfig): FeatureRule[] {
    return Object.values(this.byNames).map((feature: FeatureMetadata) => new FeatureRule(feature, config, this));
  }

  getLineTypesForColor(color: string): string[] {
    return Object.keys((this.byColors[color] || {}));
  }
}
