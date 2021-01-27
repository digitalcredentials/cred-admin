import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A user",
  name: "UserPost",
})
export class UserPostModel {
  @ApiModelProperty({
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    required: true,
  })
  isAdmin!: boolean;
}
