
const args = process.argv
const srcNm = args[2]
const VueComponentCompiler = require('@vue/component-compiler');
const fs = require('fs');
const path = require('path');

const VueCompiler = VueComponentCompiler.createDefaultCompiler();
const vComponent = VueCompiler.compileToDescriptor(srcNm, fs.readFileSync(path.resolve(srcNm), 'utf8'));
const assembledComponent = VueComponentCompiler.assemble(VueCompiler, srcNm, vComponent);

const stdout = process.stdout

stdout.setEncoding("utf8")
stdout.write(assembledComponent.code)