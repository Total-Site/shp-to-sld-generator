export class StyleGeneratorService {
    convertFeatureToRule(feature, colorMapping) {
        const color = feature.properties?.COLOR;
        const lineType = feature.properties?.LINETYPE;
        const name = `${color}${this.getShortFeatureType(lineType)}`;
        return {
            name: name,
            filter: this.getFiltersForRole(color, lineType),
            scaleDenominator: {},
            symbolizers: this.getLineSymbolizers(lineType, color, colorMapping)
        };
    }
    getLineSymbolizers(lineType, color, colorMapping) {
        const baseParams = {
            kind: 'Line',
            width: 1,
            color: colorMapping[color.toString()] || '#000000',
            join: 'bevel',
            cap: 'square'
        };
        switch (lineType) {
            case 'CONTINUOUS':
                return [baseParams];
            case 'DASHED':
                return [{
                        ...baseParams,
                        dasharray: [8, 4]
                    }];
            default:
                return [{
                        ...baseParams,
                        dasharray: [4, 2, 1, 2, 1, 2]
                    }];
        }
    }
    getFiltersForRole(color, lineType) {
        switch (lineType) {
            case 'CONTINUOUS':
            case 'DASHED':
                return [
                    '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', lineType]
                ];
            default:
                return [
                    '&&', ['==', 'COLOR', color], ['&&', ['!=', 'LINETYPE', 'CONTINUOUS'], ['!=', 'LINETYPE', 'DASHED']]
                ];
        }
    }
    getShortFeatureType(lineType) {
        switch (lineType) {
            case 'CONTINUOUS':
                return 'c';
            case 'DASHED':
                return 'd';
            default:
                return 'i';
        }
    }
}
