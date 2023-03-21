export class StyleGeneratorService {
    convertFeatureToRule(feature, config) {
        const color = feature.properties?.COLOR;
        const lineType = feature.properties?.LINETYPE || feature?.geometry?.type;
        if (!color) {
            return null;
        }
        const name = `${color}${this.getShortFeatureType(lineType)}`;
        return {
            name: name,
            filter: this.getFiltersForRole(color, lineType),
            scaleDenominator: {},
            symbolizers: this.getLineSymbolizers(lineType, color, config)
        };
    }
    getLineSymbolizers(lineType, color, config) {
        const baseParams = {
            kind: 'Line',
            width: 1,
            color: config.colorMapping[color?.toString()] || '#000000',
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
            case 'LineString':
            case 'MultiLineString':
                return [baseParams];
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
                return [
                    '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', 'Continuous']
                ];
            case 'DASHED':
                return [
                    '&&', ['==', 'COLOR', color], ['==', 'LINETYPE', 'Dashed']
                ];
            case 'LineString':
            case 'MultiLineString':
                return ['==', 'COLOR', color];
            default:
                return [
                    '&&', ['==', 'COLOR', color], ['&&', ['!=', 'LINETYPE', 'Continuous'], ['!=', 'LINETYPE', 'Dashed']]
                ];
        }
    }
    getShortFeatureType(lineType) {
        switch (lineType) {
            case 'LineString':
            case 'MultiLineString':
            case 'CONTINUOUS':
                return 'c';
            case 'DASHED':
                return 'd';
            default:
                return 'i';
        }
    }
}
