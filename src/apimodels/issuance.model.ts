import { ApiModel, ApiModelProperty } from "swagger-express-typescript";
import { CredentialGetModel } from "./credential.model";
import { RecipientGetModel } from "./recipient.model";

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
  description: "An issuance with credential and recipients",
  name: "IssuanceFullGet",
})
export class IssuanceFullGetModel {
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

  @ApiModelProperty({
    required: true,
  })
  credential!: CredentialGetModel;

  @ApiModelProperty({
    required: true,
  })
  recipients!: Array<RecipientGetModel>;
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
}
