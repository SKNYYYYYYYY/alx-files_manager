import { promisify } from 'util';
import fs from 'fs';

const fsReadAsync = promisify(fs.readFile);

(async () => {
  const data = await fsReadAsync('del.txt');
  const text = data.toString().toLocaleUpperCase();
  console.log(text);
})();
