import { Feature } from 'geojson';
import { Filter, Rule, Symbolizer } from 'geostyler-style/dist/style';
import { ShpToSldGeneratorConfig } from './shp-to-sld-generator.config';

export class StyleGeneratorService {
  public convertFeatureToRule(feature: Feature, config: ShpToSldGeneratorConfig): Rule | null {
    const color = feature.properties?.COLOR;
    const lineType = feature.properties?.LINETYPE || feature?.geometry?.type;
    if (!color) {
      return null;
    }
    const name = `${color}${this.getShortFeatureType(lineType)}`;
    return {
      name: name,
      filter: this.getFiltersForRole(color, lineType),
      scaleDenominator: {},
      symbolizers: this.getLineSymbolizers(lineType, color, config)
    };
  }

  private getLineSymbolizers(lineType: string, color: string, config: ShpToSldGeneratorConfig): Symbolizer[] {
    const baseParams: Symbolizer = {
      kind: 'Line',
      width: 1,
      color: config.colorMapping![color?.toString()] || '#000000',
      join: 'bevel',
      cap: 'square'
    };
    switch (lineType) {
      case 'CONTINUOUS':
        return [baseParams];
      case 'DASHED':
        return [{
          ...baseParams,
          dasharray: [8, 4]
        }];
      case 'LineString':
      case 'MultiLineString':
        return [baseParams];
      default:
        return [{
          ...baseParams,
          dasharray: [4, 2, 1, 2, 1, 2]
        }];
    }
  }

  private getFiltersForRole(color: string, lineType: string): Filter {
    switch (lineType) {
      case 'CONTINUOUS':
        return [
          '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', 'Continuous']
        ];
      case 'DASHED':
        return [
          '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', 'Dashed']
        ];
      case 'LineString':
      case 'MultiLineString':
        return ['==', 'COLOR', color];
      default:
        return [
          '&&', ['==', 'COLOR', color], ['&&', ['!=', 'LINETYPE', 'Continuous'], ['!=', 'LINETYPE', 'Dashed']]
        ];
    }
  }

  private getShortFeatureType(lineType: string): string {
    switch (lineType) {
      case 'LineString':
      case 'MultiLineString':
      case 'CONTINUOUS':
        return 'c';
      case 'DASHED':
        return 'd';
      default:
        return 'i';
    }
  }
}
