import aws from 'aws-sdk';
// import { region, accessKeyId, secretAccessKey, countryCode } from './config/config.js'; //Import Express
import multer from 'multer';
import multerS3 from 'multer-s3';
import store from 'store';
import weather from 'openweather-apis'
import { AthenaExpress } from 'athena-express';
import * as fs from 'fs'; // Import fs

export class responseObj { // Response Object
    success = true;
    message = "";
    payload = "";
    error = "";
};

/** Server Reponse for client side */
export function serverResponse(isSuccess, res, payload, message) {
    let apiResponse = new responseObj();
    apiResponse.success = isSuccess;
    apiResponse.message = message;
    if (isSuccess) {
        apiResponse.payload = payload;
        res.status(200).json(apiResponse);
    } else {
        res.status(500).json(apiResponse);
    }
}

// Sending SMS with AWS SNS
aws.config.update({
    region: 'ap-south-1',
    accessKeyId: 'AKIAWRU3UVSUKL7JSK5XV',
    secretAccessKey: 'yQ//n3n2J+RMcEGb8F5dk4343455dYDtbGZ0Z+W',
});

var sns = new aws.SNS();
export function sendSMS(mobileNumber, message) {
    return new Promise((resolve, reject) => {
        sns.setSMSAttributes({ attributes: { DefaultSMSType: "Transactional" } },
            function (error) {
                if (error) {
                    reject(error);
                }
            }
        );

        var params = {
            Message: message,
            MessageStructure: "string",
            PhoneNumber: '+91' + '8940959609',
        };

        sns.publish(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export function getmime(extension) {
    if (extension == '.gif') return 'image/gif';
    else if (extension == '.png') return 'image/png';
    else if (extension == 'jpg') return 'image/jpg';
    else if (extension == '.svg') return 'image/svg+xml';
    else if (extension == '.ico') return 'image/ico';
    else 'text/html';
}

const BUCKET_NAME = "aqgx-media-files";

const s3bucket = new aws.S3({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

var s3 = new aws.S3({})

export var uploadImageToS3 = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'aqgx-media-files',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, 'pond_images/image-' + Date.now() + '_' + file.originalname)
        }
    })
});

export function currentuser() {
    return store.get('user');
}

const params = {
    Bucket: BUCKET_NAME,
    Key: ''
};

export var deleteImageFromS3 = function (imgName) {
    params.Key = imgName;
    return new Promise((resolve, reject) => {
        s3.createBucket({
            Bucket: BUCKET_NAME
        }, function () {
            s3.deleteObject(params, function (err, data) {
                if (err) { console.log(err); return reject(err) }
                else
                    console.log(
                        "Successfully deleted file from bucket"
                    )
                console.log(data);
                return resolve(data)
            });
        });
    });
};

// check http://openweathermap.org/appid#get for get the APPID
// User Name: AQGX-OWM and the key below mentioned 
weather.setAPPID('33362f499035e6b06477bf237427ad1c');

export var getWeatherData = function (lat, long) {
    return new Promise((resolve, reject) => {
        weather.setCoordinate(lat, long);
        weather.getAllWeather(function (err, JSONObj) {
            if (err) { console.log(err); return reject(err) }
            else
                console.log("Successfully received weather data")
            return resolve(JSONObj)
        });
    });
}

const athenaExpressConfig = {
    aws: aws,
    s3: "s3://athena-response-history",
    getStats: true
};

const athenaExpress = new AthenaExpress(athenaExpressConfig);

export var connectAthena = function (query) {
    return new Promise((resolve, reject) => {
        athenaExpress.query(query)
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

// Create a new service object and buffer
var glacier = new aws.Glacier({ apiVersion: '2012-06-01' });

// No more than 4GB otherwise use multipart upload

export var UploadToGlacier = function (model) {

    var buf = Buffer.from(JSON.stringify(model));

    var params = { vaultName: 'YieldPonds', body: buf };

    return new Promise((resolve, reject) => {
        glacier.uploadArchive(params, function (err, data) {
            if (err) {
                console.log("Error uploading archive!", err); return reject(err)
            }
            else {
                console.log("Archive ID", data.archiveId);
                return resolve(data)
            }
        });
    });
}

