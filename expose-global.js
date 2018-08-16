const Fs = require('fs');
const Path = require('path');
const UglifyJS = require('uglify-es');

const copyright = '/*! NsLogger | (c) Stéphane Francel | https://github.com/avine/ns-logger */';

const resolve = (...args) => Path.resolve(__dirname, ...args);

Fs.readFile(resolve('./index.js'), { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const result = UglifyJS.minify(data);
  const code = `(function(exports){${result.code}})(this.NsLogger=this.NsLogger||{});`;

  const writeFile = (path) => {
    Fs.writeFile(path, `${copyright}\n${code}`, { encoding: 'utf-8' }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };
  writeFile(resolve('./ns-logger.js'));
  writeFile(resolve('./demo/ns-logger.js'));
});
