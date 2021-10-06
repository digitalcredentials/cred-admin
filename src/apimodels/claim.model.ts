import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A Claim",
  name: "ClaimPost",
})
export class ClaimPostModel {
  @ApiModelProperty({
    required: true,
  })
  holder!: string;
}
@ApiModel({
  description: "Info needed for claiming a credential",
  name: "ClaimGet",
})
export class ClaimGetModel {
  @ApiModelProperty({
    required: true,
  })
  url!: string;

  @ApiModelProperty({
    required: true,
  })
  qr!: string;

  @ApiModelProperty({
    required: true,
  })
  title!: string;
}
