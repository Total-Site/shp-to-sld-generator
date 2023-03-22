import { ShpToSldGeneratorConfig } from '../model/shp-to-sld-generator.config';
import { FeatureMetadata } from './feature-metadata';
import { Filter, Rule, ScaleDenominator, Symbolizer } from 'geostyler-style/dist/style';
import { FeatureType } from '../model/feature-type';
import { FeaturesRegistry } from './features-registry';

export class FeatureRule implements Rule {
  name: string;
  symbolizers: Symbolizer[];
  filter?: Filter;
  scaleDenominator?: ScaleDenominator;

  constructor(featureMetadata: FeatureMetadata, config: ShpToSldGeneratorConfig, registry: FeaturesRegistry) {
    this.name = featureMetadata.getName();
    this.filter = this.getFiltersForFeatureMetadata(featureMetadata, registry);
    this.scaleDenominator = {};
    this.symbolizers = this.getLineSymbolizersForFeature(featureMetadata, config);
  }

  private getFiltersForFeatureMetadata(featureMetadata: FeatureMetadata, registry: FeaturesRegistry): Filter {
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

  private getFilterForOtherTypes(color: string, registry: FeaturesRegistry): Filter {
    const lines = registry.getLineTypesForColor(color);
    if (lines.length > 0) {
      return [
        '&&', ['==', 'COLOR', color], this.getSubFilterForUsedLineTypes(lines, '&&', '!=')
      ];
    } else {
      return ['==', 'COLOR', color];
    }
  }

  private getSubFilterForUsedLineTypes(lineTypes: string[], mainOperator: '||' | '&&' = '||', equalityOperator: '==' | '!=' = '=='): Filter {
    const ors: Filter[] = lineTypes.map((lineType: string) => [equalityOperator, 'LINETYPE', lineType]);
    return ors.length > 1 ? [mainOperator, ...ors] : ors[0];
  }

  private getLineSymbolizersForFeature(featureMetadata: FeatureMetadata, config: ShpToSldGeneratorConfig): Symbolizer[] {
    const baseParams: Symbolizer = {
      kind: 'Line',
      width: 1,
      color: config.colorMapping![featureMetadata.getColor()?.toString()] || '#000000',
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
