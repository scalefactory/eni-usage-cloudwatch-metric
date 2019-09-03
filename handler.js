'use strict';

const AWS = require('aws-sdk');
const ec2 = new AWS.EC2();
const cw = new AWS.CloudWatch();

module.exports.run = (event) => {
  console.log("Starting")
  let ec2Params = {
    MaxResults: 1000
  };

  ['attached', 'detached'].forEach(type => {
    ec2Params['Filters'] = [
      {
        'Name': 'attachment.status',
        'Values': [
          type
        ]
      }
    ];

    ec2.describeNetworkInterfaces(ec2Params, function(err, data) {
      if (err) {
        console.log("Error", err)
      } else {
        const cwParams = {
          MetricData: [
            {
              MetricName: 'eniUsage',
              Dimensions: [
                {
                  Name: 'AttachmentStatus',
                  Value: type
                }
              ],
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
  });


};
