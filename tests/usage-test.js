import { ShpToSldStyleGenerator } from '../dist/index.js';
import {glob} from 'glob';
import * as path from 'path';

const generator = new ShpToSldStyleGenerator({
  stylerParams: {
    builderOptions: {
      format: true,
      indentBy: ' '
    }
  }
});

glob('tests/data/**/*.shp').then((files) => {
  files.forEach(file => {
    const fullPath = path.resolve(file);
    console.log(`Parsing the file ${fullPath}...`);
    generator.generateFromShpFile(file, fullPath).then((result) => {
      console.log(result);
    });
  });
})
