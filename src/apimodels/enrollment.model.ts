import { ApiModel, ApiModelProperty } from "swagger-express-typescript";

@ApiModel({
  description: "An enrollment",
  name: "Enrollment",
})
export class EnrollmentModel {
  @ApiModelProperty({
    description: "",
    required: true,
  })
  recipientId!: number;

  @ApiModelProperty({
    description: "",
    required: false,
  })
  isApproved?: boolean;
}
