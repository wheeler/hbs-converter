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

const itConverts = (inFile) => {
  const expectedFile = inFile.replace(/.hbs/, '.expected.jsx');
  const outPath = fixture(`${basename(inFile, extname(inFile))}${extname(expectedFile)}`);

  beforeEach(async () => {
    await removeFile(outPath);
  });

  afterEach(async () => {
    await removeFile(outPath);
  });

  it(`converts ${inFile} successfully`, async () => {
    const [output, expected] = await Promise.all([
      convertFile(fixture(inFile), outPath),
      readFile(fixture(expectedFile), 'utf8'),
    ]);

    expect(output).to.equal(expected);
  }).timeout(5000);
};

describe('hbs-converter', () => {
  context('when the template has no props', () => {
    itConverts('single-div.hbs');
  });
  context('when the template one prop', () => {
    itConverts('one-prop.hbs');
  });
  context('when the template multiple props', () => {
    itConverts('three-props.hbs');
  });
});
