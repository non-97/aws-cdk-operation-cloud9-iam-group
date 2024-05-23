import * as cdk from "aws-cdk-lib";

export interface User {
  userName: string;
  emailAddress?: string;
}

export interface Role {
  roleName?: string;
  rolePrincipalUserNames?: string[];
  rolePrincipalUserArns?: string[];
  projectName: string;
  ssmSessionRunAs: string;
}

export interface OperationUsersProperty {
  users: User[];
  roles: Role[];
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
    roles: [
      {
        rolePrincipalUserNames: ["non-97-test-user1"],
        projectName: "Test Project 1",
        ssmSessionRunAs: "os-user1",
      },
      {
        rolePrincipalUserNames: ["non-97-test-user2"],
        projectName: "Test Project 2",
        ssmSessionRunAs: "os-user2",
      },
      {
        roleName: "non-97-project-ope-role",
        rolePrincipalUserNames: ["non-97-test-user1"],
        rolePrincipalUserArns: [
          "arn:aws:iam::<AWSアカウントID>:user/non-97-test-user3",
        ],
        projectName: "Test Project 2",
        ssmSessionRunAs: "os-user3",
      },
    ],
  },
};
