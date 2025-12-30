#!/usr/bin/env node

import { Command } from "commander";
import pkg from "../package.json" assert { type: "json" };
import { clCommand } from "./commands/cl";
import { nbCommand } from "./commands/nb";
import { prCommand } from "./commands/pr";
import { syCommand } from "./commands/sy";

const program = new Command();

program.name("gt").description(pkg.description).version(pkg.version);

nbCommand(program);
syCommand(program);
clCommand(program);
prCommand(program);

program.parse();
