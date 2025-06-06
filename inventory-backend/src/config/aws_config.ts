import AWS from 'aws-sdk';
import { AWS_KEY_ID, AWS_REGION, AWS_SECRET_KEY } from './config';


AWS.config.update({
    accessKeyId : AWS_KEY_ID,
    secretAccessKey : AWS_SECRET_KEY,
    region : AWS_REGION
});

const s3 = new AWS.S3();

export default s3;