import * as cdk from "aws-cdk-lib";

export interface User {
  userName: string;
  emailAddress?: string;
}

export interface OperationUsersProperty {
  users: User[];
}

export interface OperationUsersStackProperty {
  env?: cdk.Environment;
  props: OperationUsersProperty;
}

export const operationUsersStackProperty: OperationUsersStackProperty = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  props: {
    users: [
      {
        userName: "non-97-test-user1",
        emailAddress: "test-user1@non-97.net",
      },
      {
        userName: "non-97-test-user2",
      },
    ],
  },
};
