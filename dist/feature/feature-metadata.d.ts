import { Feature } from 'geojson';
import { FeatureType } from '../model/feature-type';
export declare class FeatureMetadata {
    private readonly color;
    private lineTypes;
    private readonly name;
    private readonly type;
    constructor(feature: Feature);
    getColor(): string;
    getName(): string;
    getType(): FeatureType;
    getLineTypesMap(): {
        [name: string]: boolean;
    };
    getLineTypes(): string[];
    merge(otherFeature: FeatureMetadata): void;
    private generateFeatureType;
    private getFeatureName;
}
