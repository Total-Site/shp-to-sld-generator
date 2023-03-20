import * as Shapefile from 'shapefile';
import { Source } from 'shapefile';
import { Feature } from 'geojson';
import * as SLDParser from 'geostyler-sld-parser';
import { Style, WriteStyleResult } from 'geostyler-style';
import { Rule } from 'geostyler-style/dist/style';
import { StyleGeneratorService } from './style-generator.service';
import { defaultColorMapping } from './default-color-mapping';
import { ShpToSldGeneratorConfig } from './shp-to-sld-generator.config';
import { ShapefileParsingError, ShapefileReadError, StyleWritingError } from './errors';


export class ShpToSldStyleGenerator {
  private combinations: any = {};
  private parser: SLDParser.SldStyleParser;
  private styleService: StyleGeneratorService;
  private readonly config: ShpToSldGeneratorConfig;

  /**
   * A standard way to initialize the class.
   * @param config Optional parameters for the generator.
   */
  constructor(config?: ShpToSldGeneratorConfig) {
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
  public async generateFromShpFile(styleName: string, shpFile: string): Promise<WriteStyleResult<string>> {
    const style: Style = {
      rules: [],
      name: styleName
    };
    return this.getRulesFromShp(shpFile)
      .then((rules: Rule[]) => {
        style.rules = rules;
        return style;
      })
      .then(() => this.parser.writeStyle(style))
      .catch((error) => {
        throw new StyleWritingError(error);
      });
  }

  private async getRulesFromShp(shpFile: string) {
    return Shapefile.open(shpFile)
      .catch((error) => {
        throw new ShapefileReadError(error);
      })
      .then((source: Source<Feature>) => source.read().then(
        (result: { done: boolean, value: Feature }) => this.processFeature([], source, result))
      )
      .catch((error) => {
        throw new ShapefileParsingError(error);
      });
  }

  private processFeature(rules: Rule[], source: Source<Feature>, result: { done: boolean, value: Feature }): Promise<Rule[]> {
    if (result.done) return Promise.resolve(rules);
    const rule = this.styleService.convertFeatureToRule(result.value, this.config);
    if (rule && !this.combinations[rule.name]) {
      rules.push(rule);
      this.combinations[rule.name] = true;
    }
    return source.read().then((result: { done: boolean, value: Feature }) => this.processFeature(rules, source, result));
  }
}
