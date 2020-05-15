const SQS = require('aws-sdk/clients/sqs');

const sqs = new SQS();

const requestData = {
    QueueName: "node_standard-queue"
};

const createQueue = data => sqs.createQueue(data).promise();

const listQueues = _ => sqs.listQueues().promise();

const printQueueUrls = ({ QueueUrls }) => QueueUrls.forEach(queueUrl => console.log(queueUrl));

createQueue(requestData)
    .then(listQueues)
    .then(printQueueUrls)
    .catch(console.log);