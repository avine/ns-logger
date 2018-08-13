const fs = require('fs');
const UglifyJS = require("uglify-es");

fs.readFile('index.js', { encoding: 'utf-8' }, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }

  const result = UglifyJS.minify(data);
  const code = `((exports)=>{${result.code}})(this.NsLogger=this.NsLogger||{});`;

  const copyright = '/*! NsLogger | (c) Stéphane Francel | https://github.com/avine/ns-logger */';

  fs.writeFile('ns-logger.js', `${copyright}\n${code}`, { encoding: 'utf-8' }, (err) => {
    if (err) {
      console.log(err);
    }
  });
});
