import { FeatureMetadata } from './feature-metadata';
import { FeatureRule } from './feature-rule';
import { ShpToSldGeneratorConfig } from '../model/shp-to-sld-generator.config';
export declare class FeaturesRegistry {
    private readonly byNames;
    private readonly byColors;
    constructor();
    addFeature(featureMetadata: FeatureMetadata): void;
    getFeatureRules(config: ShpToSldGeneratorConfig): FeatureRule[];
    getLineTypesForColor(color: string): string[];
}
