import { ConstructorParams as StylerParams } from 'geostyler-sld-parser';

export interface ShpToSldGeneratorConfig {
  /**
   * Additional parameters that will be provided for the underlying library
   */
  stylerParams?: StylerParams,
  /**
   * Mapping for color (represented as a string) + value (HEX representation of a color)
   * By default, the library has generated HEX colors for every autodesk palette color.
   * You can overwrite it by specifying it by yourself.
   */
  colorMapping?: { [name: string]: string }
  /**
   * If set to true, the application will try to fix issues with Geoserver namespaces validation
   */
  fixGeoserverNamespacesValidation: boolean;
}
