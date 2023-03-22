import { FeatureRule } from './feature-rule';
import { FeatureType } from '../model/feature-type';
export class FeaturesRegistry {
    constructor() {
        this.byColors = {};
        this.byNames = {};
    }
    addFeature(featureMetadata) {
        const name = featureMetadata.getName();
        const color = featureMetadata.getColor();
        if (this.byNames[name]) {
            this.byNames[name].merge(featureMetadata);
        }
        else {
            this.byNames[name] = featureMetadata;
        }
        if (featureMetadata.getType() !== FeatureType.OTHER) {
            this.byColors[color] = {
                ...(this.byColors[color] || {}),
                ...featureMetadata.getLineTypesMap()
            };
        }
    }
    getFeatureRules(config) {
        return Object.values(this.byNames).map((feature) => new FeatureRule(feature, config, this));
    }
    getLineTypesForColor(color) {
        return Object.keys((this.byColors[color] || {}));
    }
}
