import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "An issuance",
  name: "Issuance",
})
export class IssuanceModel {
  @ApiModelProperty({
    required: false,
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
