import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role } from "../../parameter/index";

export interface RoleConstructProps {
  roles: Role[];
}

export class RoleConstruct extends Construct {
  readonly users: cdk.aws_iam.IUser[];

  constructor(scope: Construct, id: string, props: RoleConstructProps) {
    super(scope, id);

    const ssmSessionManagerPolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "SsmSessionManagerPolicy",
      {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["arn:aws:ssm:*:*:session/${aws:username}-*"],
            actions: ["ssm:ResumeSession", "ssm:TerminateSession"],
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["arn:aws:ssm:*:*:document/*"],
            actions: ["ssm:StartSession"],
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["ssm:StartSession", "ssm:GetConnectionStatus"],
            conditions: {
              StringEquals: {
                "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}",
              },
            },
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["*"],
            actions: [
              "ssm:DescribeInstanceInformation",
              "ssm:DescribeSessions",
            ],
          }),
        ],
      }
    );

    const ec2InstanceStartStopPolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "Ec2InstanceStartStopPolicy",
      {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["ec2:DescribeInstances"],
          }),
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["ec2:StartInstances", "ec2:StopInstances"],
            conditions: {
              StringEquals: {
                "aws:ResourceTag/Project": "${aws:PrincipalTag/Project}",
              },
            },
          }),
        ],
      }
    );

    props.roles.forEach((roleInfo) => {
      const principalFromUserArns = roleInfo.rolePrincipalUserArns?.map(
        (rolePrincipalUserArn) => {
          return new cdk.aws_iam.ArnPrincipal(rolePrincipalUserArn);
        }
      );

      const principalFromUserNames = roleInfo.rolePrincipalUserNames?.map(
        (rolePrincipalUserName) => {
          return new cdk.aws_iam.ArnPrincipal(
            `arn:aws:iam::${
              cdk.Stack.of(this).account
            }:user/${rolePrincipalUserName}`
          );
        }
      );

      const principals = [
        ...(principalFromUserArns ?? []),
        ...(principalFromUserNames ?? []),
      ];

      if (!principals) {
        return;
      }

      const role = new cdk.aws_iam.Role(
        this,
        `${roleInfo.projectName}_${roleInfo.ssmSessionRunAs}OperationRole`,
        {
          roleName: roleInfo.roleName,
          assumedBy: new cdk.aws_iam.CompositePrincipal(
            ...principals
          ).withConditions({
            Bool: {
              "aws:MultiFactorAuthPresent": "true",
            },
          }),
          managedPolicies: [
            ssmSessionManagerPolicy,
            ec2InstanceStartStopPolicy,
          ],
        }
      );

      cdk.Tags.of(role).add("Project", roleInfo.projectName);
      cdk.Tags.of(role).add("SSMSessionRunAs", roleInfo.ssmSessionRunAs);
    });
  }
}
