import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A group",
  name: "GroupGet",
})
export class GroupGetModel {
  @ApiModelProperty({
    required: true,
  })
  id!: number;

  @ApiModelProperty({
    required: true,
  })
  name!: string;
}

@ApiModel({
  description: "A group",
  name: "GroupPost",
})
export class GroupPostModel {
  @ApiModelProperty({
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    required: true,
  })
  didDoc!: Record<string, never>;

  @ApiModelProperty({
    required: true,
  })
  didKeyId!: string;
}
