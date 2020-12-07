import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A credential",
  name: "Credential",
})
export class CredentialModel {
  @ApiModelProperty({
    required: false,
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
