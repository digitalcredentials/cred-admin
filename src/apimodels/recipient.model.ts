import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A credential recipient",
  name: "RecipientGet",
})
export class RecipientGetModel {
  @ApiModelProperty({
    required: true,
  })
  id!: number;

  @ApiModelProperty({
    description: "",
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    description: "",
    required: true,
  })
  email!: string;

  @ApiModelProperty({
    description: "",
    required: false,
  })
  did?: string;

  @ApiModelProperty({
    description: "",
    required: false,
  })
  externalId?: string;
}

@ApiModel({
  description: "A credential recipient",
  name: "RecipientPost",
})
export class RecipientPostModel {
  @ApiModelProperty({
    description: "",
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    description: "",
    required: true,
  })
  email!: string;

  @ApiModelProperty({
    description: "",
    required: false,
  })
  did?: string;

  @ApiModelProperty({
    description: "",
    required: false,
  })
  externalId?: string;
}
