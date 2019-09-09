'use strict'
const AWS = require('aws-sdk')
const statusNames = ['available', 'in-use']

const buildEc2Params = (statusNamesArr) => ({
  MaxResults: 1000,
  Filters: [{
    Name: 'status',
    Values: statusNamesArr,
  }],
});

const buildMetricParams = (ENIs, statusNamesArr) => ({
  MetricData: [
    ...statusNamesArr.map((statusName) => (
      {
        MetricName: 'ENIStatus',
        Dimensions: [{
          Name: 'Status',
          Value: statusName,
        }],
        Value: ENIs.filter(({ Status }) => Status === statusName).length,
        Unit: 'Count',
      }
    )),
  ],
  Namespace: 'EniUsage',
});

module.exports.run = async () => {
  const ec2 = new AWS.EC2();
  const cloudWatch = new AWS.CloudWatch();

  const ec2Params = buildEc2Params([...statusNames])
  const { NetworkInterfaces } = await ec2.describeNetworkInterfaces(ec2Params).promise()
  const metricParams = buildMetricParams(NetworkInterfaces, [...statusNames])
  console.info('METRIC PARAMS:', JSON.stringify(metricParams, null, 2))

  const cloudWatchResponse = await cloudWatch.putMetricData(metricParams).promise()
  console.info('CLOUDWATCH RESPONSE:', JSON.stringify(cloudWatchResponse, null, 2))
}
