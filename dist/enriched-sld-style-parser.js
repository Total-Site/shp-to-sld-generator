import * as SLDParser from 'geostyler-sld-parser';
export class EnrichedSldStyleParser extends SLDParser.SldStyleParser {
    constructor(opts) {
        super(opts);
        SLDParser.SldStyleParser.combinationMap = this.getCombinationMap();
        SLDParser.SldStyleParser.negationOperatorMap = this.getNegationOperatorMap();
        SLDParser.SldStyleParser.comparisonMap = this.getComparisonMap();
    }
    /**
     * Fixing the invalid schema name
     */
    geoStylerStyleToSldObject(style) {
        const result = super.geoStylerStyleToSldObject(style);
        result[1][':@']['@_xsi:schemaLocation'] = 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd';
        this.removeTitleFromUserStyle(result);
        return result;
    }
    /**
     * The Title object for some reason causes the Geoserver to display the validation error:
     * java.lang.RuntimeException: Parsing failed for UserStyle: java.lang.ClassCastException: class java.util.HashMap cannot be cast to class org.opengis.util.InternationalString
     */
    removeTitleFromUserStyle(style) {
        const namedLayer = style[1]?.StyledLayerDescriptor[0]?.NamedLayer;
        const userStyle = namedLayer?.find((child) => !!child.UserStyle);
        if (userStyle) {
            userStyle.UserStyle = userStyle.UserStyle.filter((item) => !item['se:Title'] && !item['Title']);
        }
    }
    /**
     * Adding a proper namespace attribute to Filters
     */
    getSldRulesFromRules(rules) {
        const results = super.getSldRulesFromRules(rules);
        results.forEach((result) => {
            result['se:Rule'].forEach((rule) => {
                if (rule['ogc:Filter']) {
                    rule[':@'] = {
                        '@_xmlns:se': 'http://www.opengis.net/se'
                    };
                }
            });
        });
        return results;
    }
    /**
     * Adding namespaces to property names
     */
    getSldComparisonFilterFromComparisonFilter(comparisonFilter) {
        const result = super.getSldComparisonFilterFromComparisonFilter(comparisonFilter);
        if (result.length > 0) {
            const cmpFilter = result[0];
            Object.keys(cmpFilter).forEach((cmpFilterName) => {
                const cmpProps = cmpFilter[cmpFilterName];
                cmpFilter[cmpFilterName] = cmpProps.map((property) => {
                    if (property.PropertyName) {
                        return { 'ogc:PropertyName': property.PropertyName };
                    }
                    if (property.Literal) {
                        return { 'ogc:Literal': property.Literal };
                    }
                    return property;
                });
            });
        }
        return result;
    }
    /**
     * Renaming tags to include proper namespaces
     */
    getNegationOperatorMap() {
        return {
            'ogc:Not': '!'
        };
    }
    getCombinationMap() {
        return {
            'ogc:And': '&&',
            'ogc:Or': '||',
            'ogc:PropertyIsBetween': '&&'
        };
    }
    getComparisonMap() {
        return {
            'ogc:PropertyIsEqualTo': '==',
            'ogc:PropertyIsNotEqualTo': '!=',
            'ogc:PropertyIsLike': '*=',
            'ogc:PropertyIsLessThan': '<',
            'ogc:PropertyIsLessThanOrEqualTo': '<=',
            'ogc:PropertyIsGreaterThan': '>',
            'ogc:PropertyIsGreaterThanOrEqualTo': '>=',
            'ogc:PropertyIsNull': '==',
            'ogc:PropertyIsBetween': '<=x<='
        };
    }
}
