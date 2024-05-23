import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { User } from "../../parameter/index";

export interface UserConstructProps {
  users: User[];
  group: cdk.aws_iam.IGroup;
}

export class UserConstruct extends Construct {
  readonly users: cdk.aws_iam.IUser[];

  constructor(scope: Construct, id: string, props: UserConstructProps) {
    super(scope, id);

    this.users = props.users.map((userInfo) => {
      const user = new cdk.aws_iam.User(this, userInfo.userName, {
        userName: userInfo.userName,
        groups: [props.group],
        passwordResetRequired: false,
      });

      if (userInfo.emailAddress) {
        cdk.Tags.of(user).add("E-mail Address", userInfo.emailAddress);
      }
      return user;
    });
  }
}
