import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface GroupConstructProps {}

export class GroupConstruct extends Construct {
  readonly group: cdk.aws_iam.IGroup;

  constructor(scope: Construct, id: string, props?: GroupConstructProps) {
    super(scope, id);

    const assumeRolePolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "AssumeRolePolicy",
      {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: ["*"],
            actions: ["sts:AssumeRole"],
          }),
        ],
      }
    );

    const createAccessKeyPolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "CreateAccessKeyPolicy",
      {
        statements: [
          new cdk.aws_iam.PolicyStatement({
            effect: cdk.aws_iam.Effect.ALLOW,
            resources: [
              "arn:aws:iam::" +
                cdk.Stack.of(this).account +
                ":user/${aws:username}",
            ],
            actions: [
              "iam:GetAccessKeyLastUsed",
              "iam:ListAccessKeys",
              "iam:CreateAccessKey",
              "iam:DeleteAccessKey",
              "iam:UpdateAccessKey",
            ],
          }),
        ],
      }
    );

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

    const enforceMfaPolicy = new cdk.aws_iam.ManagedPolicy(
      this,
      "EnforceMfaPolicy",
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
              "iam:ResyncMFADevice",
              "iam:ListMFADevices",
            ],
          }),
          new cdk.aws_iam.PolicyStatement({
            sid: "RestrictActionsWithoutMfa",
            effect: cdk.aws_iam.Effect.DENY,
            resources: ["*"],
            notActions: [
              "iam:ChangePassword",
              "iam:CreateVirtualMFADevice",
              "iam:DeleteVirtualMFADevice",
              "iam:DeactivateMFADevice",
              "iam:EnableMFADevice",
              "iam:GetLoginProfile",
              "iam:GetUser",
              "iam:ResyncMFADevice",
              "iam:ListMFADevices",
            ],
            conditions: {
              BoolIfExists: {
                "aws:MultiFactorAuthPresent": "false",
              },
            },
          }),
        ],
      }
    );

    const group = new cdk.aws_iam.Group(this, "Default", {
      managedPolicies: [
        assumeRolePolicy,
        createAccessKeyPolicy,
        tagPolicy,
        enforceMfaPolicy,
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "IAMSelfManageServiceSpecificCredentials"
        ),
      ],
    });
    this.group = group;
  }
}
