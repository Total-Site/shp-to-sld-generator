import { ShpToSldGeneratorConfig } from '../model/shp-to-sld-generator.config';
import { FeatureMetadata } from './feature-metadata';
import { Filter, Rule, ScaleDenominator, Symbolizer } from 'geostyler-style/dist/style';
import { FeaturesRegistry } from './features-registry';
export declare class FeatureRule implements Rule {
    name: string;
    symbolizers: Symbolizer[];
    filter?: Filter;
    scaleDenominator?: ScaleDenominator;
    constructor(featureMetadata: FeatureMetadata, config: ShpToSldGeneratorConfig, registry: FeaturesRegistry);
    private getFiltersForFeatureMetadata;
    private getFilterForOtherTypes;
    private getSubFilterForUsedLineTypes;
    private getLineSymbolizersForFeature;
}
