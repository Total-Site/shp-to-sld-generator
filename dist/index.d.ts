import { WriteStyleResult } from 'geostyler-style';
import { ConstructorParams as StylerParams } from 'geostyler-sld-parser';
export declare class ShpToSldStyleGenerator {
    private combinations;
    private parser;
    private styleService;
    private colorMapping;
    /**
     * A standard way to initialize the class.
     * @param stylerParams Optional parameters for the SLD parser.
     */
    constructor(stylerParams?: StylerParams);
    /**
     * By default, the library has generated HEX colors for every autodesk palette color.
     * You can overwrite it by specifying it by yourself.
     * @param colorMapping Mapping for color (represented as a string) + value (HEX representation of a color)
     */
    setColorMapping(colorMapping: {
        [name: string]: string;
    }): void;
    /**
     * Loads a .shp file and generates a style for shapefile definition found in that style.
     * @param styleName The name for the style that will be generated
     * @param shpFile Path to the local .shp file containing the shapefile definition
     */
    generateFromShpFile(styleName: string, shpFile: string): Promise<WriteStyleResult<string>>;
    private getRulesFromShp;
    private processFeature;
}
