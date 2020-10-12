import {
  Table,
  Column,
  Model,
  Unique,
  ForeignKey,
  Default,
} from "sequelize-typescript";
import { Recipient } from "./Recipient";
import { Issuance } from "./Issuance";

@Table
export class RecipientIssuance extends Model implements RecipientIssuance {
  @Default({ value: false })
  @Column
  isIssued?: boolean;

  @Column
  issuedAt?: Date;

  @Default({ value: false })
  @Column
  isApproved?: boolean;

  @Column
  approvedAt?: Date;

  @Unique
  @Column
  awardId?: string;

  @ForeignKey(() => Recipient)
  recipient!: Recipient;

  @ForeignKey(() => Issuance)
  issuance!: Array<Issuance>;
}
