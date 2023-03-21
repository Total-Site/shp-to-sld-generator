import * as SLDParser from 'geostyler-sld-parser';
import { Rule, Style, ComparisonFilter } from 'geostyler-style';
import { ConstructorParams } from 'geostyler-sld-parser';
export declare class EnrichedSldStyleParser extends SLDParser.SldStyleParser {
    constructor(opts?: ConstructorParams);
    /**
     * Fixing the invalid schema name
     */
    geoStylerStyleToSldObject(style: Style): any;
    /**
     * The Title object for some reason causes the Geoserver to display the validation error:
     * java.lang.RuntimeException: Parsing failed for UserStyle: java.lang.ClassCastException: class java.util.HashMap cannot be cast to class org.opengis.util.InternationalString
     */
    private removeTitleFromUserStyle;
    /**
     * Adding a proper namespace attribute to Filters
     */
    getSldRulesFromRules(rules: Rule[]): any[];
    /**
     * Adding namespaces to property names
     */
    getSldComparisonFilterFromComparisonFilter(comparisonFilter: ComparisonFilter): any[];
    /**
     * Renaming tags to include proper namespaces
     */
    getNegationOperatorMap(): any;
    getCombinationMap(): any;
    getComparisonMap(): any;
}
