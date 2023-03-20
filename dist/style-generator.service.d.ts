import { Feature } from 'geojson';
import { Rule } from 'geostyler-style/dist/style';
import { ShpToSldGeneratorConfig } from './shp-to-sld-generator.config';
export declare class StyleGeneratorService {
    convertFeatureToRule(feature: Feature, config: ShpToSldGeneratorConfig): Rule | null;
    private getLineSymbolizers;
    private getFiltersForRole;
    private getShortFeatureType;
}
