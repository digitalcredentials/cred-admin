import express from 'express';
import { ApiPath, ApiOperationGet, ApiOperationPost, SwaggerDefinitionConstant } from 'swagger-express-typescript';
import { controller, httpGet, interfaces } from 'inversify-express-utils';
import { injectable } from 'inversify';

@ApiPath({
    path: '/versions',
    name: 'Version',
    security: { basicAuth: [] }
})
@controller('/versions')
@injectable()
export class VersionController implements interfaces.Controller {
    public static TARGET_NAME: string = 'VersionController';

    private data = [{
            id: '1',
            name: 'Version 1',
            description: 'Description Version 1',
            version: '1.0.0'
        },
    ];

    @ApiOperationGet({
        description: 'Get versions objects list',
        summary: 'Get versions list',
        responses: {
            200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: 'Version' }
        },
        security: {
            apiKeyHeader: []
        }
    })
    @httpGet('/')
    public getVersions(request: express.Request, response: express.Response, next: express.NextFunction): void {
        response.json(this.data);
    }
}
