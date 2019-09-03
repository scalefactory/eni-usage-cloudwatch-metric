'use strict';

const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const cw = new AWS.CloudWatch();

module.exports.run = (event) => {
  console.log("Starting")
  const ec2Params = {
    MaxResults: 1000
  };

  ec2.describeNetworkInterfaces(ec2Params, function(err, data) {
    if (err) {
      console.log("Error", err)
    } else {
      console.log(`Found ${data.NetworkInterfaces.length} ENIS`)

      const cwParams = {
        MetricData: [
          {
            MetricName: 'eniUsage',
            Value: data.NetworkInterfaces.length
          },
        ],
        Namespace: 'EniUsage'
      };

      cw.putMetricData(cwParams, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", JSON.stringify(data));
        }
      });
    }
  });
};
