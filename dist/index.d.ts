import { WriteStyleResult } from 'geostyler-style';
import { ShpToSldGeneratorConfig } from './model/shp-to-sld-generator.config';
export declare class ShpToSldStyleGenerator {
    private parser;
    private readonly config;
    /**
     * A standard way to initialize the class.
     * @param config Optional parameters for the generator.
     */
    constructor(config?: ShpToSldGeneratorConfig);
    /**
     * Loads a .shp file and generates a style for shapefile definition found in that style.
     * @param styleName The name for the style that will be generated
     * @param shpFile Path to the local .shp file containing the shapefile definition
     */
    generateFromShpFile(styleName: string, shpFile: string): Promise<WriteStyleResult<string>>;
    private getRulesFromShp;
    private processFeature;
}
