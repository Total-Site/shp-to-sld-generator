import * as Shapefile from 'shapefile';
import { Source } from 'shapefile';
import { Feature } from 'geojson';
import * as SLDParser from 'geostyler-sld-parser';
import { Style, WriteStyleResult } from 'geostyler-style';
import { Rule } from 'geostyler-style/dist/style';
import { ConstructorParams as StylerParams } from 'geostyler-sld-parser';
import { StyleGeneratorService } from './style-generator.service';
import { defaultColorMapping } from './default-color-mapping';

export class ShpToSldStyleGenerator {
  private combinations: any = {};
  private parser: SLDParser.SldStyleParser;
  private styleService: StyleGeneratorService;
  private colorMapping: { [name: string]: string };

  /**
   * A standard way to initialize the class.
   * @param stylerParams Optional parameters for the SLD parser.
   */
  constructor(stylerParams?: StylerParams) {
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
  public setColorMapping(colorMapping: { [name: string]: string }) {
    this.colorMapping = colorMapping;
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
      .then(() => this.parser.writeStyle(style));
  }


  private async getRulesFromShp(shpFile: string) {
    return Shapefile.open(shpFile)
      .then((source: Source<Feature>) => source.read().then(
        (result: { done: boolean, value: Feature }) => this.processFeature([], source, result))
      );
  }

  private processFeature(rules: Rule[], source: Source<Feature>, result: { done: boolean, value: Feature }): Promise<Rule[]> {
    if (result.done) return Promise.resolve(rules);
    const rule = this.styleService.convertFeatureToRule(result.value, this.colorMapping);
    if (!this.combinations[rule.name]) {
      rules.push(rule);
      this.combinations[rule.name] = true;
    }
    return source.read().then((result: { done: boolean, value: Feature }) => this.processFeature(rules, source, result));
  }
}
