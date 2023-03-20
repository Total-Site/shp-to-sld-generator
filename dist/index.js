import * as Shapefile from 'shapefile';
import * as SLDParser from 'geostyler-sld-parser';
import { StyleGeneratorService } from './style-generator.service';
import { defaultColorMapping } from './default-color-mapping';
import { ShapefileParsingError, ShapefileReadError, StyleWritingError } from './errors';
export class ShpToSldStyleGenerator {
    /**
     * A standard way to initialize the class.
     * @param config Optional parameters for the generator.
     */
    constructor(config) {
        this.combinations = {};
        this.config = {
            colorMapping: defaultColorMapping
        };
        this.parser = new SLDParser.SldStyleParser(config?.stylerParams);
        this.styleService = new StyleGeneratorService();
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
            .then(() => this.parser.writeStyle(style))
            .catch((error) => {
            throw new StyleWritingError(error);
        });
    }
    async getRulesFromShp(shpFile) {
        return Shapefile.open(shpFile)
            .catch((error) => {
            throw new ShapefileReadError(error);
        })
            .then((source) => source.read().then((result) => this.processFeature([], source, result)))
            .catch((error) => {
            throw new ShapefileParsingError(error);
        });
    }
    processFeature(rules, source, result) {
        if (result.done)
            return Promise.resolve(rules);
        const rule = this.styleService.convertFeatureToRule(result.value, this.config);
        if (rule && !this.combinations[rule.name]) {
            rules.push(rule);
            this.combinations[rule.name] = true;
        }
        return source.read().then((result) => this.processFeature(rules, source, result));
    }
}
