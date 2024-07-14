import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { OperationUsersProperty } from "../parameter";
import { GroupConstruct } from "./construct/group-construct";
import { UserConstruct } from "./construct/user-construct";

export interface OperationUsersStackProps
  extends cdk.StackProps,
    OperationUsersProperty {}

export class OperationUsersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OperationUsersStackProps) {
    super(scope, id, props);

    const groupConstruct = new GroupConstruct(this, "GroupConstruct");

    const userConstruct = new UserConstruct(this, "UserConstruct", {
      users: props.users,
      group: groupConstruct.group,
    });
  }
}
