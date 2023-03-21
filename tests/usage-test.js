import { ShpToSldStyleGenerator } from '../dist/index.js';
import {glob} from 'glob';
import * as path from 'path';
import fs from 'fs';

const generator = new ShpToSldStyleGenerator({
  stylerParams: {
    builderOptions: {
      format: true,
      indentBy: ' ',
    }
  }
});

const resultsDir = 'tests/data/results';
if(!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}
glob('tests/data/**/*.shp').then((files) => {
  files.forEach(file => {
    const fullPath = path.resolve(file);
    console.log(`Parsing the file ${fullPath}...`);
    generator.generateFromShpFile('test_name', fullPath).then((result) => {
      fs.writeFileSync(`${resultsDir}/${path.basename(file)}.sld`, result.output);
    });
  });
})
