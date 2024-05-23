#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { OperationUsersStack } from "../lib/operation-users-stack";
import { operationUsersStackProperty } from "../parameter/index";

const app = new cdk.App();
new OperationUsersStack(app, "OperationUsersStack", {
  env: operationUsersStackProperty.env,
  ...operationUsersStackProperty.props,
});
