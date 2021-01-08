import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A group",
  name: "Group",
})
export class GroupModel {
  @ApiModelProperty({
    required: false,
  })
  id!: number;

  @ApiModelProperty({
    required: true,
  })
  name!: string;
}
