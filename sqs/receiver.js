const SQS = require('aws-sdk/clients/sqs');
const _ = require('lodash');

const sqs = new SQS();

const FIFO_QUEUE_NAME = 'node_fifo-queue.fifo';
const STANDARD_QUEUE_NAME = 'node_standard-queue';

const extractMessageIds = ({ Messages }) => (Messages || [])
    .map(message => ({ amazonId: message.MessageId, customId: JSON.parse(message.Body).id }));

const computeQueueUrl = queueName => sqs.getQueueUrl({ QueueName: queueName }).promise();

const receiveMessagesWithVisibilityTimeout = async (queueName, VisibilityTimeout) => {
    const { QueueUrl } = await computeQueueUrl(queueName);

    const requestParams = {
        QueueUrl,
        VisibilityTimeout, // 30 seconds by default. Min: 0, Max: 12 hours,
        MaxNumberOfMessages: 10 // 1 by default. Min: 1, Max: 10.
    };

    //receiveMessage won't delete the message. You should do it explicitly.
    const messageIds1 = extractMessageIds(await sqs.receiveMessage(requestParams).promise());
    const messageIds2 = extractMessageIds(await sqs.receiveMessage(requestParams).promise());

    const duplicatedMessageIds = _.intersectionBy(messageIds1, messageIds2, 'customId');

    console.log("Messages 1", messageIds1);
    console.log("Messages 2", messageIds2);

    console.log("Duplicated message ids: ", duplicatedMessageIds);
};

/*
 * - Each request will contain duplicates (message1 will contain duplicated messages, as well as message2).
 * - The intersection of message1 and message2 could contain duplicates messages.
 *
 * Because there's no visibilityTimeout and it's a standard queue (no delivery-once enforcement)
 * containing only a few messages (9).
 */

 receiveMessagesWithVisibilityTimeout(STANDARD_QUEUE_NAME, 0);

/*
 * - There won't be any duplicated message on each individual request (message1 and message2).
 * - The responses won't have an intersection either.
 *
 * This happens because of a high visibility timeout.
 */
receiveMessagesWithVisibilityTimeout(STANDARD_QUEUE_NAME, 60);

/*
 * 1. The same response will not contain duplicated messages on it.
 * 2. Each response will bring messages in order depending on a group ID.
 * 3. It could be an intersection of messages in thes two responses.
 *
 * 1. and 2. happen because it is a FIFO queue, and 3. happens because the abscence of visibility timeout.
 */
receiveMessagesWithVisibilityTimeout(FIFO_QUEUE_NAME, 0);

/*
 * - The same response will not contain duplicated messages on it.
 * - Each response will bring messages in order depending on a group ID.
 * - No intersection among the two responses.
 *
 * All these three items happen because it is a FIFO queue and it possess a long visibility timeout (20 seconds).
 */
receiveMessagesWithVisibilityTimeout(FIFO_QUEUE_NAME, 20);