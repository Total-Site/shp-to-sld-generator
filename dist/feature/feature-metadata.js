import { FeatureType } from '../model/feature-type';
export class FeatureMetadata {
    constructor(feature) {
        const lineTypeName = feature.properties?.LINETYPE || feature?.geometry?.type;
        this.lineTypes = {};
        this.lineTypes[lineTypeName] = true;
        this.color = feature.properties?.COLOR;
        this.type = this.generateFeatureType(lineTypeName);
        this.name = this.getFeatureName(this.color, this.type);
    }
    getColor() {
        return this.color;
    }
    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    getLineTypesMap() {
        return this.lineTypes;
    }
    getLineTypes() {
        return Object.keys(this.lineTypes);
    }
    merge(otherFeature) {
        this.lineTypes = {
            ...this.lineTypes,
            ...otherFeature.lineTypes
        };
    }
    generateFeatureType(lineName) {
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
    getFeatureName(color, featureType) {
        return `${color}${featureType.toLowerCase().charAt(0)}`;
    }
}
