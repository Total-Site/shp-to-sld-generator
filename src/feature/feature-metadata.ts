import { Feature } from 'geojson';
import { FeatureType } from '../model/feature-type';

export class FeatureMetadata {
  private readonly color: string;
  private lineTypes: { [name: string]: boolean };
  private readonly name: string;
  private readonly type: FeatureType;

  constructor(feature: Feature) {
    const lineTypeName = feature.properties?.LINETYPE || feature?.geometry?.type;
    this.lineTypes = {};
    this.lineTypes[lineTypeName] = true;

    this.color = feature.properties?.COLOR;
    this.type = this.generateFeatureType(lineTypeName);
    this.name = this.getFeatureName(this.color, this.type);
  }

  public getColor(): string {
    return this.color;
  }

  public getName(): string {
    return this.name;
  }

  public getType(): FeatureType {
    return this.type;
  }

  public getLineTypesMap(): { [name: string]: boolean } {
    return this.lineTypes;
  }

  public getLineTypes(): string[] {
    return Object.keys(this.lineTypes);
  }

  public merge(otherFeature: FeatureMetadata) {
    this.lineTypes = {
      ...this.lineTypes,
      ...otherFeature.lineTypes
    };
  }

  private generateFeatureType(lineName: string): FeatureType {
    const lowered = lineName.toLowerCase();
    switch (lowered) {
      case lowered.match(/continuous/)?.input:
        return FeatureType.CONTINUOUS;
      case 'linestring':
      case 'multilinestring':
        return FeatureType.TEXT;
      case lowered.match(/dashed/)?.input:
        return FeatureType.DASHED;
      default:
        return FeatureType.OTHER;
    }
  }

  private getFeatureName(color: string, featureType: FeatureType): string {
    return `${color}${featureType.toLowerCase().charAt(0)}`;
  }
}
