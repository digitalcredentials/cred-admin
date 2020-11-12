import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "A credential recipient",
  name: "Recipient",
})
export class RecipientModel {
  @ApiModelProperty({
    required: false,
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
