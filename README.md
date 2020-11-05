# Auction Service

![auction-service](https://user-images.githubusercontent.com/20465844/98271107-a34ea200-1fa0-11eb-9e34-98b1ed8d53b4.png)

This project makes use of some of the `Amazon Web Services` which are:

* API Gateway
* Lambda Functions
* S3 Bucket
* DynamoDB
* EventBridge
* SQS
* SES


## Must Know
* JWT is used to authorize the requests. Therefore you need to obtain a bearer token and include it in your `Authorization` header of your requests. Auth0 is quite handy for this kind of stuff so it is used in this project. Feel free to use whichever 3rd party you like.

* Don't forget to include your secret in secret.pem file located at root dir of the project.

* Authorization is handled at auth layer of the project.

* To notify the bidders and sellers via email, an EventBridge cron runs on certain interval specified in `Serverless.yml` and sends data to SQS queue which a lambda consumes to send email. Because email sending is out of this project's scope, you need to implement that part. See `custom.MailQueue` section in `Serverless.yml` file to configure necessary arn and url. 

## Get Started
```
sls deploy -v --stage dev
```

## ToDo
Travis-CI
