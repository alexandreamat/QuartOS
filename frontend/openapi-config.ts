import type { ConfigFile } from "@rtk-query/codegen-openapi";

const config: ConfigFile = {
  apiFile: "./src/app/services/emptyApi.ts",
  schemaFile: "http://nginx/api/openapi.json",
  apiImport: "emptySplitApi",
  outputFile: "./src/app/services/generatedApi.ts",
  exportName: "generatedApi",
  hooks: false,
  tag: true,
  flattenArg: true,
};

export default config;
