import {
  Table,
  Column,
  Model,
  Unique,
  ForeignKey,
  BelongsTo,
  Default,
} from "sequelize-typescript";
import { Recipient } from "./Recipient";
import { Issuance } from "./Issuance";

@Table
export class RecipientIssuance extends Model implements RecipientIssuance {
  @Default(false)
  @Column
  isIssued?: boolean;

  @Column
  issuedAt?: Date;

  @Default(false)
  @Column
  isApproved?: boolean;

  @Column
  approvedAt?: Date;

  @Unique
  @Column
  awardId?: string;

  @ForeignKey(() => Recipient)
  @Column
  recipientId!: number;

  @BelongsTo(() => Recipient)
  recipient!: Recipient;

  @ForeignKey(() => Issuance)
  @Column
  issuanceId!: number;

  @BelongsTo(() => Issuance)
  issuance!: Issuance;
}
