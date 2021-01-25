import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "An issuance",
  name: "IssuanceGet",
})
export class IssuanceGetModel {
  @ApiModelProperty({
    required: true,
  })
  id!: number;

  @ApiModelProperty({
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    required: true,
    format: "date",
  })
  issueDate!: string;

  @ApiModelProperty({
    required: true,
  })
  credentialid!: number;
}

@ApiModel({
  description: "An issuance",
  name: "IssuancePost",
})
export class IssuancePostModel {
  @ApiModelProperty({
    required: true,
  })
  name!: string;

  @ApiModelProperty({
    required: true,
    format: "date",
  })
  issueDate!: string;

  @ApiModelProperty({
    required: true,
  })
  credentialid!: number;
}
