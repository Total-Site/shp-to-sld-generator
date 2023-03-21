import * as Shapefile from 'shapefile';
import { StyleGeneratorService } from './style-generator.service';
import { defaultColorMapping } from './default-color-mapping';
import { ShapefileParsingError, ShapefileReadError, StyleWritingError } from './errors';
import { EnrichedSldStyleParser } from './enriched-sld-style-parser';
import deepmerge from 'deepmerge';
export class ShpToSldStyleGenerator {
    /**
     * A standard way to initialize the class.
     * @param config Optional parameters for the generator.
     */
    constructor(config) {
        this.combinations = {};
        this.styleService = new StyleGeneratorService();
        this.config = deepmerge({
            colorMapping: defaultColorMapping,
            stylerParams: {
                sldVersion: '1.1.0'
            }
        }, config || {});
        this.parser = new EnrichedSldStyleParser(this.config.stylerParams);
    }
    /**
     * Loads a .shp file and generates a style for shapefile definition found in that style.
     * @param styleName The name for the style that will be generated
     * @param shpFile Path to the local .shp file containing the shapefile definition
     */
    async generateFromShpFile(styleName, shpFile) {
        return this.getRulesFromShp(shpFile)
            .then((rules) => {
            return {
                rules,
                name: styleName
            };
        })
            .then((style) => this.parser.writeStyle(style))
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
