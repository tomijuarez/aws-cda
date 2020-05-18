const SQS = require('aws-sdk/clients/sqs');

const sqs = new SQS();

const FIFO_QUEUE_NAME = 'node_fifo-queue.fifo'; // The queue name must end with ".fifo" suffix if it is a FIFO queue.
const STANDARD_QUEUE_NAME = 'node_standard-queue';

const fifoQueueRequest = {
    QueueName: FIFO_QUEUE_NAME,
    Attributes: {
        "FifoQueue": "true" // False by default -> standard
    }
};

const standardQueueRequest = {
    QueueName: STANDARD_QUEUE_NAME // Standard by default.
};

const createQueue = data => sqs.createQueue(data).promise();

const listQueues = _ => sqs.listQueues().promise();

const extractUrls = ({ QueueUrls }) => QueueUrls;

Promise.all([createQueue(standardQueueRequest), createQueue(fifoQueueRequest)])
    .then(listQueues)
    .then(queuesData => console.log("standard and fifo queues created at ", extractUrls(queuesData)))
    .catch(console.log);