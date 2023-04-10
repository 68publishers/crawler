import {config as runDotenv} from 'dotenv';
import {Bootstrap} from './src/bootstrap.mjs';

runDotenv();

Bootstrap.boot()
    .resolve('application')
    .run();
