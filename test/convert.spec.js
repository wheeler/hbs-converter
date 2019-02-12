const fs = require('fs');
const { expect } = require('chai');
const util = require('util');
const { basename, extname } = require('path');

const exec = util.promisify(require('child_process').exec);

const unlink = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);

const removeFile = async (path) => {
  try {
    await unlink(path);
  } catch (e) {
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
};

const fixture = path => `./test/fixtures/${path}`;

const convertFile = async (inPath, outPath) => {
  await exec(`./bin/hbs-converter.js ${inPath}`);
  return readFile(outPath, 'utf8');
};

const itConverts = (inFile, skip) => {
  const expectedFile = inFile.replace(/.hbs/, '.expected.jsx');
  const outPath = fixture(`${basename(inFile, extname(inFile))}${extname(expectedFile)}`);

  beforeEach(async () => {
    await removeFile(outPath);
  });

  afterEach(async () => {
    await removeFile(outPath);
  });

  const testDescription = `converts ${inFile} successfully`;

  if (skip) {
    return it.skip(testDescription);
  }

  it(testDescription, async () => {
    const [output, expected] = await Promise.all([
      convertFile(fixture(inFile), outPath),
      readFile(fixture(expectedFile), 'utf8'),
    ]);

    expect(output).to.equal(expected);
  }).timeout(5000);
};

describe('hbs-converter', () => {
  fs.readdirSync('./test/fixtures').forEach((file) => {
    if (extname(file) === '.hbs') {
      const skip = basename(file, '.hbs').endsWith('skip');
      itConverts(file, skip);
    }
  });
});
