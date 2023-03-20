import * as Shapefile from 'shapefile';
import * as SLDParser from 'geostyler-sld-parser';
import { StyleGeneratorService } from './style-generator.service';
import { defaultColorMapping } from './default-color-mapping';
export class ShpToSldStyleGenerator {
    /**
     * A standard way to initialize the class.
     * @param stylerParams Optional parameters for the SLD parser.
     */
    constructor(stylerParams) {
        this.combinations = {};
        this.parser = new SLDParser.SldStyleParser({
            ...(stylerParams || {})
        });
        this.styleService = new StyleGeneratorService();
        this.colorMapping = defaultColorMapping;
    }
    /**
     * By default, the library has generated HEX colors for every autodesk palette color.
     * You can overwrite it by specifying it by yourself.
     * @param colorMapping Mapping for color (represented as a string) + value (HEX representation of a color)
     */
    setColorMapping(colorMapping) {
        this.colorMapping = colorMapping;
    }
    /**
     * Loads a .shp file and generates a style for shapefile definition found in that style.
     * @param styleName The name for the style that will be generated
     * @param shpFile Path to the local .shp file containing the shapefile definition
     */
    async generateFromShpFile(styleName, shpFile) {
        const style = {
            rules: [],
            name: styleName
        };
        return this.getRulesFromShp(shpFile)
            .then((rules) => {
            style.rules = rules;
            return style;
        })
            .then(() => this.parser.writeStyle(style));
    }
    async getRulesFromShp(shpFile) {
        return Shapefile.open(shpFile)
            .then((source) => source.read().then((result) => this.processFeature([], source, result)));
    }
    processFeature(rules, source, result) {
        if (result.done)
            return Promise.resolve(rules);
        const rule = this.styleService.convertFeatureToRule(result.value, this.colorMapping);
        if (!this.combinations[rule.name]) {
            rules.push(rule);
            this.combinations[rule.name] = true;
        }
        return source.read().then((result) => this.processFeature(rules, source, result));
    }
}
