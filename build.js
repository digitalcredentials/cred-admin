const fs = require("fs-extra");

try {
  // Remove current build
  fs.removeSync("./dist/");
  fs.copySync("./src/swagger", "./dist/swagger");
} catch (err) {
  console.log(err);
}
