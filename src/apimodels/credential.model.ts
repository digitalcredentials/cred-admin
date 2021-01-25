import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A credential",
  name: "CredentialGet",
})
export class CredentialGetModel {
  @ApiModelProperty({
    required: true,
  })
  id!: number;

  @ApiModelProperty({
    required: true,
  })
  title!: string;

  @ApiModelProperty({
    required: true,
  })
  template!: Record<string, unknown>;

  @ApiModelProperty({
    required: true,
  })
  groupid!: number;
}

@ApiModel({
  description: "A credential",
  name: "CredentialPost",
})
export class CredentialPostModel {
  @ApiModelProperty({
    required: true,
  })
  title!: string;

  @ApiModelProperty({
    required: true,
  })
  template!: Record<string, unknown>;

  @ApiModelProperty({
    required: true,
  })
  groupid!: number;
}
