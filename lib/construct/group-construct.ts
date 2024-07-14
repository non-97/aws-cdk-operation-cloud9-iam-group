import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface GroupConstructProps {}

export class GroupConstruct extends Construct {
  readonly group: cdk.aws_iam.IGroup;

  constructor(scope: Construct, id: string, props?: GroupConstructProps) {
    super(scope, id);

    const tagPolicy = new cdk.aws_iam.ManagedPolicy(this, "TagPolicy", {
      statements: [
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: [
            "arn:aws:iam::" +
              cdk.Stack.of(this).account +
              ":user/${aws:username}",
          ],
          actions: ["iam:ListUserTags", "iam:UntagUser", "iam:TagUser"],
        }),
      ],
    });

    const selfManagedMfaPolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "SelfManagedMfaPolicy",
      {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            sid: "SelfManagedMfa",
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: [
              "arn:aws:iam::" +
                cdk.Stack.of(this).account +
                ":mfa/${aws:username}*",
              "arn:aws:iam::" +
                cdk.Stack.of(this).account +
                ":user/${aws:username}*",
            ],
            actions: [
              "iam:ChangePassword",
              "iam:CreateVirtualMFADevice",
              "iam:DeleteVirtualMFADevice",
              "iam:DeactivateMFADevice",
              "iam:EnableMFADevice",
              "iam:GetLoginProfile",
              "iam:GetUser",
              "iam:GetUserPolicy",
              "iam:ListGroupsForUser",
              "iam:ListAttachedUserPolicies",
              "iam:ListUserPolicies",
              "iam:ResyncMFADevice",
              "iam:ListMFADevices",
            ],
          }),
        ],
      }
    );

    const cloud9Policy = new cdk.aws_iam.ManagedPolicy(this, "Cloud9Policy", {
      statements: [
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["*"],
          actions: ["cloud9:CreateEnvironmentEC2"],
          conditions: {
            StringLike: {
              "cloud9:EnvironmentName": "${aws:username}*",
              "cloud9:InstanceType": [
                "t3.nano",
                "t3.micro",
                "t3.small",
                "t3.medium",
                "t3.large",
              ],
            },
            Null: {
              "cloud9:OwnerArn": "true",
            },
          },
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["*"],
          actions: [
            "cloud9:DescribeEnvironments",
            "cloud9:DescribeEnvironmentStatus",
            "cloud9:DescribeEnvironmentMemberships",
            "cloud9:ListEnvironments",
            "cloud9:ListTagsForResource",
            "cloud9:UpdateUserSettings",
            "ec2:DescribeVpcs",
            "ec2:DescribeSubnets",
            "ec2:DescribeInstanceTypeOfferings",
            "ec2:DescribeRouteTables",
          ],
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["arn:aws:iam::*:role/service-role/*"],
          actions: ["iam:ListRoles", "iam:ListInstanceProfilesForRole"],
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: [
            "arn:aws:iam::*:role/service-role/AWSCloud9SSMAccessRole",
          ],
          actions: ["iam:ListInstanceProfilesForRole", "iam:CreateRole"],
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: [
            "arn:aws:iam::*:role/service-role/AWSCloud9SSMAccessRole",
          ],
          actions: ["iam:AttachRolePolicy"],
          conditions: {
            StringEquals: {
              "iam:PolicyARN":
                "arn:aws:iam::aws:policy/AWSCloud9SSMInstanceProfile",
            },
          },
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: [
            "arn:aws:iam::*:role/service-role/AWSCloud9SSMAccessRole",
          ],
          actions: ["iam:PassRole"],
          conditions: {
            StringEquals: {
              "iam:PassedToService": "ec2.amazonaws.com",
            },
          },
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: [
            "arn:aws:iam::*:instance-profile/cloud9/AWSCloud9SSMInstanceProfile",
          ],
          actions: [
            "iam:CreateInstanceProfile",
            "iam:AddRoleToInstanceProfile",
          ],
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["*"],
          actions: ["iam:CreateServiceLinkedRole"],
          conditions: {
            StringEquals: {
              "iam:AWSServiceName": "cloud9.amazonaws.com",
            },
          },
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["arn:aws:ec2:*:*:instance/*"],
          actions: ["ssm:StartSession", "ssm:GetConnectionStatus"],
          conditions: {
            StringLike: {
              "ssm:resourceTag/aws:cloud9:environment": "*",
            },
            StringEquals: {
              "aws:CalledViaFirst": "cloud9.amazonaws.com",
            },
          },
        }),
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          resources: ["arn:aws:ssm:*:*:document/*"],
          actions: ["ssm:StartSession"],
        }),
      ],
    });

    const group = new cdk.aws_iam.Group(this, "Default", {
      managedPolicies: [tagPolicy, selfManagedMfaPolicy, cloud9Policy],
    });
    this.group = group;
  }
}
