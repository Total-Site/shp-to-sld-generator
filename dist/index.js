import * as Shapefile from 'shapefile';
import * as SLDParser from 'geostyler-sld-parser';
import { defaultColorMapping } from './model/default-color-mapping';
import { ShapefileParsingError, ShapefileReadError, StyleWritingError } from './model/errors';
import { EnrichedSldStyleParser } from './helpers/enriched-sld-style-parser';
import deepmerge from 'deepmerge';
import { FeatureMetadata } from './feature/feature-metadata';
import { FeaturesRegistry } from './feature/features-registry';
export class ShpToSldStyleGenerator {
    /**
     * A standard way to initialize the class.
     * @param config Optional parameters for the generator.
     */
    constructor(config) {
        this.config = deepmerge({
            colorMapping: defaultColorMapping,
            stylerParams: {
                sldVersion: '1.1.0'
            },
            fixGeoserverNamespacesValidation: true
        }, config || {});
        this.parser = this.config.fixGeoserverNamespacesValidation
            ? new EnrichedSldStyleParser(this.config.stylerParams)
            : new SLDParser.SldStyleParser(this.config.stylerParams);
    }
    /**
     * Loads a .shp file and generates a style for shapefile definition found in that style.
     * @param styleName The name for the style that will be generated
     * @param shpFile Path to the local .shp file containing the shapefile definition
     */
    async generateFromShpFile(styleName, shpFile) {
        const registry = new FeaturesRegistry();
        return this.getRulesFromShp(shpFile, registry)
            .then(() => registry.getFeatureRules(this.config))
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
    async getRulesFromShp(shpFile, registry) {
        return Shapefile.open(shpFile)
            .catch((error) => {
            throw new ShapefileReadError(error);
        })
            .then((source) => source.read().then((result) => this.processFeature(registry, source, result)))
            .catch((error) => {
            throw new ShapefileParsingError(error);
        });
    }
    processFeature(registry, source, result) {
        if (result.done)
            return Promise.resolve();
        const featureMetadata = new FeatureMetadata(result.value);
        if (featureMetadata) {
            registry.addFeature(featureMetadata);
        }
        return source.read().then((result) => this.processFeature(registry, source, result));
    }
}
