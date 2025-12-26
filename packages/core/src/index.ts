#!/usr/bin/env node

import { Command } from "commander";
import { clCommand } from "./commands/cl";
import { nbCommand } from "./commands/nb";
import { prCommand } from "./commands/pr";
import { syCommand } from "./commands/sy";

const program = new Command();

program
  .name("gt")
  .description("Git Turbo - A CLI tool to speed up your Git workflow")
  .version("0.0.1");

nbCommand(program);
syCommand(program);
clCommand(program);
prCommand(program);

program.parse();
