import { Feature } from 'geojson';
import { Rule } from 'geostyler-style/dist/style';
export declare class StyleGeneratorService {
    convertFeatureToRule(feature: Feature, colorMapping: {
        [name: string]: string;
    }): Rule;
    private getLineSymbolizers;
    private getFiltersForRole;
    private getShortFeatureType;
}
