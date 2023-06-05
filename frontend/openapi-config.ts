import type { ConfigFile } from '@rtk-query/codegen-openapi'

const config: ConfigFile = {
    apiFile: './src/app/services/emptyApi.ts',
    schemaFile: 'http://localhost:8000/api/openapi.json',
    apiImport: 'emptySplitApi',
    outputFile: './src/app/services/api.ts',
    exportName: 'api',
    hooks: false,
    tag: true,
    flattenArg: true,
}

export default config