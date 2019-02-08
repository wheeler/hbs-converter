const fs = require('fs');
const util = require('util');
const { dirname, basename, extname } = require('path');
const jscodeshift = require('jscodeshift');
const fixTemplateLiteralTransform = require('./fixTemplateLiteralTransform');
const reactClassTransform = require('./reactClassTransform');
const pureComponentTransform = require('./pureComponentTransform');
const prettier = require('prettier');
const { compile: hbsToJsx } = require('handlebars-to-jsx');
const CLIEngine = require('./localCLIEngine');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const runCodemod = (codemod, options = {}, nullIfUnchanged = false) => ({ source, path }) => ({
  source: codemod(
    { path, source },
    { j: jscodeshift, jscodeshift, stats: () => {} },
    options,
  ) || (!nullIfUnchanged && source),
  path,
});

const runTransform = transform => ({ source, path }) => ({
  source: transform(source),
  path,
});

const fixTemplateLiteral = runCodemod(fixTemplateLiteralTransform);

const convertToClass = runCodemod(reactClassTransform, { 'pure-component': true });

const convertToFunctional = runCodemod(pureComponentTransform, {
  useArrows: true,
  destructuring: true,
});

const prettify = runTransform(source =>
  prettier.format(source, {
    singleQuote: true,
    trailingComma: 'all',
  }),
);

const lintFix = ({ source, path }) => {
  if (CLIEngine) {
    const engine = new CLIEngine({ fix: true, cwd: process.cwd() });
    const { results } = engine.executeOnText(source, path);
    if (results.length === 1) {
      source = results[0].output || source;
    }
  }

  return { source, path };
};

// Handlebars Specific Transformers
const handleWhitespace = runTransform((source) => {
  let newSource;

  newSource = source.replace(/^[\s\n]+/, '');
  newSource = newSource.replace(/[\s\n]+$/, '');
  newSource = newSource.replace(/}}[\s\n]+</g, '}}<');
  newSource = newSource.replace(/>[\s\n]+{{/g, '>{{');
  return newSource;
});

const convertHandlebars = ({ source, path }) => {
  const newSource = hbsToJsx(source, { isComponent: true, isModule: true });
  const newPath = `${dirname(path)}/${basename(path, extname(path))}.jsx`;
  return { source: newSource, path: newPath };
};

const setupPropTypes = runTransform((source) => {
  const propFinder = /props\.(\w+)/g;
  const propNames = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while (match = propFinder.exec(source)) {
    propNames.push(match[1]);
  }

  // short circuit if nothing to do.
  if (propNames.length === 0) {
    return source.replace(/props =>/, '() =>');
  }

  const propNamesJson = propNames.reduce((reduction, propName) => `${reduction}\n${propName}: PropTypes.any.isRequired,`, '');
  const newSource = `import PropTypes from 'prop-types';\n${source.replace(/export default/, 'const Component = ')}\n\nComponent.propTypes = {${propNamesJson}}\n\nexport default Component;`;

  // TODO: convert
  //         `props => <div>props.something</div>;`
  //       to
  //         `({something}) => <div>something</div>;`

  return newSource;
});

const setupImport = runTransform(source => `import React from 'react';\n${source}`);
// END Handlebars Specific Transformers


const runSteps = (...fns) =>
  fns.reduce((prevFn, nextFn) =>
    value => nextFn(prevFn(value)),
  value => value,
);

const convert = runSteps(
  // wrapInDivToAvoidOuterFragment
  handleWhitespace,
  convertHandlebars,
  setupPropTypes,
  setupImport,
  fixTemplateLiteral,
  convertToClass,
  convertToFunctional,
  prettify,
  lintFix,
);

module.exports = async function convertFile(coffeePath) {
  try {
    const { source, path } = convert({
      source: await readFile(coffeePath, 'utf8'),
      path: coffeePath,
    });

    await writeFile(path, source);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
