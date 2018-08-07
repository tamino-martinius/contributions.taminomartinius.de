# GitHub Contributions UI

[Visit Website](https://contributions.taminomartinius.de)

![Preview](public/preview.gif?raw=true)

## Requirement

You need to create a json file including statistics about your commit. I created another [another GitHub project](https://github.com/tamino-martinius/lambda-get-all-github-contributions) to fetch them with an AWS lambda function (can also be fetched locally using `sam local`.

## Configuration

Change the `GITHUB_USER_LOGIN` to the filename of your statistics json.

## Run locally

- `npm install` (once)
- `npm run start` (to start the local webserver on port 3000)

## Deploy

You can either run `npm run build:production` to create the release code at the `dist` folder, or change the settings at the `config` file in the root directory to deploy the code to AWS S3 with `npm run deploy`.

The project is build to run best within the same s3 bucket which is used for the lambda function.
