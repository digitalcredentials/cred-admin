import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';

// Setup command line options
const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'development',
        type: String,
    },
]);

// Set the env file
if (process.env.NODE_ENV !== 'production') {
  const result2 = dotenv.config();

  if (result2.error) {
      throw result2.error;
  }
}
