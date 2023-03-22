import * as Shapefile from 'shapefile';
import { Source } from 'shapefile';
import { Feature } from 'geojson';
import * as SLDParser from 'geostyler-sld-parser';
import { Style, WriteStyleResult } from 'geostyler-style';
import { Rule } from 'geostyler-style/dist/style';
import { defaultColorMapping } from './model/default-color-mapping';
import { ShpToSldGeneratorConfig } from './model/shp-to-sld-generator.config';
import { ShapefileParsingError, ShapefileReadError, StyleWritingError } from './model/errors';
import { EnrichedSldStyleParser } from './helpers/enriched-sld-style-parser';
import deepmerge from 'deepmerge';
import { FeatureMetadata } from './feature/feature-metadata';
import { FeaturesRegistry } from './feature/features-registry';

export class ShpToSldStyleGenerator {
  private parser: SLDParser.SldStyleParser;
  private readonly config: ShpToSldGeneratorConfig;

  /**
   * A standard way to initialize the class.
   * @param config Optional parameters for the generator.
   */
  constructor(config?: ShpToSldGeneratorConfig) {
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
  public async generateFromShpFile(styleName: string, shpFile: string): Promise<WriteStyleResult<string>> {
    const registry = new FeaturesRegistry();
    return this.getRulesFromShp(shpFile, registry)
      .then(() => registry.getFeatureRules(this.config))
      .then((rules: Rule[]) => {
        return {
          rules,
          name: styleName
        };
      })
      .then((style: Style) => this.parser.writeStyle(style))
      .catch((error) => {
        throw new StyleWritingError(error);
      });
  }

  private async getRulesFromShp(shpFile: string, registry: FeaturesRegistry) {
    return Shapefile.open(shpFile)
      .catch((error) => {
        throw new ShapefileReadError(error);
      })
      .then((source: Source<Feature>) => source.read().then(
        (result: { done: boolean, value: Feature }) => this.processFeature(registry, source, result))
      )
      .catch((error) => {
        throw new ShapefileParsingError(error);
      });
  }

  private processFeature(registry: FeaturesRegistry, source: Source<Feature>, result: { done: boolean, value: Feature }): Promise<void> {
    if (result.done) return Promise.resolve();
    const featureMetadata = new FeatureMetadata(result.value);
    if (featureMetadata) {
      registry.addFeature(featureMetadata);
    }
    return source.read().then((result: { done: boolean, value: Feature }) => this.processFeature(registry, source, result));
  }
}
