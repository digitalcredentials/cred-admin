const fs = require('fs-extra');
const childProcess = require('child_process');


try {
    // Remove current build
    fs.removeSync('./dist/');
    fs.copySync('./src/swagger', './dist/swagger');
} catch (err) {
    console.log(err);
}
