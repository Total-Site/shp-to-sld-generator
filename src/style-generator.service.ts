import { Feature } from 'geojson';
import { Filter, Rule, Symbolizer } from 'geostyler-style/dist/style';

export class StyleGeneratorService {
  public convertFeatureToRule(feature: Feature, colorMapping: { [name: string]: string }): Rule {
    const color = feature.properties?.COLOR;
    const lineType = feature.properties?.LINETYPE;
    const name = `${color}${this.getShortFeatureType(lineType)}`;
    return {
      name: name,
      filter: this.getFiltersForRole(color, lineType),
      scaleDenominator: {},
      symbolizers: this.getLineSymbolizers(lineType, color, colorMapping)
    };
  }

  private getLineSymbolizers(lineType: string, color: string, colorMapping: { [name: string]: string }): Symbolizer[] {
    const baseParams: Symbolizer = {
      kind: 'Line',
      width: 1,
      color: colorMapping[color.toString()] || '#000000',
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
      case 'DASHED':
        return [
          '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', lineType]
        ];
      default:
        return [
          '&&', ['==', 'COLOR', color], ['&&', ['!=', 'LINETYPE', 'CONTINUOUS'], ['!=', 'LINETYPE', 'DASHED']]
        ];
    }
  }

  private getShortFeatureType(lineType: string): string {
    switch (lineType) {
      case 'CONTINUOUS':
        return 'c';
      case 'DASHED':
        return 'd';
      default:
        return 'i';
    }
  }
}
