import { FeatureType } from '../model/feature-type';
export class FeatureRule {
    constructor(featureMetadata, config, registry) {
        this.name = featureMetadata.getName();
        this.filter = this.getFiltersForFeatureMetadata(featureMetadata, registry);
        this.scaleDenominator = {};
        this.symbolizers = this.getLineSymbolizersForFeature(featureMetadata, config);
    }
    getFiltersForFeatureMetadata(featureMetadata, registry) {
        switch (featureMetadata.getType()) {
            case FeatureType.DASHED:
            case FeatureType.CONTINUOUS:
                return [
                    '&&', ['==', 'COLOR', featureMetadata.getColor()], this.getSubFilterForUsedLineTypes(featureMetadata.getLineTypes())
                ];
            case FeatureType.TEXT:
                return ['==', 'COLOR', featureMetadata.getColor()];
            default:
                return this.getFilterForOtherTypes(featureMetadata.getColor(), registry);
        }
    }
    getFilterForOtherTypes(color, registry) {
        const lines = registry.getLineTypesForColor(color);
        if (lines.length > 0) {
            return [
                '&&', ['==', 'COLOR', color], this.getSubFilterForUsedLineTypes(lines, '&&', '!=')
            ];
        }
        else {
            return ['==', 'COLOR', color];
        }
    }
    getSubFilterForUsedLineTypes(lineTypes, mainOperator = '||', equalityOperator = '==') {
        const ors = lineTypes.map((lineType) => [equalityOperator, 'LINETYPE', lineType]);
        return ors.length > 1 ? [mainOperator, ...ors] : ors[0];
    }
    getLineSymbolizersForFeature(featureMetadata, config) {
        const baseParams = {
            kind: 'Line',
            width: 1,
            color: config.colorMapping[featureMetadata.getColor()?.toString()] || '#000000',
            join: 'bevel',
            cap: 'square'
        };
        switch (featureMetadata.getType()) {
            case FeatureType.TEXT:
            case FeatureType.CONTINUOUS:
                return [baseParams];
            case FeatureType.DASHED:
                return [{
                        ...baseParams,
                        dasharray: [8, 4]
                    }];
            default:
                return [{
                        ...baseParams,
                        dasharray: [4, 2, 1, 2, 1, 2]
                    }];
        }
    }
}
