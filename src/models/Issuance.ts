import {
  Table,
  Column,
  Model,
  AllowNull,
  BelongsTo,
  BelongsToMany,
  ForeignKey,
} from "sequelize-typescript";
import { Credential } from "./Credential";
import { Recipient } from "./Recipient";
import { RecipientIssuance } from "./RecipientIssuance";

@Table
export class Issuance extends Model implements Issuance {
  @AllowNull(false)
  @Column
  name!: string;

  @Column
  issueDate!: Date;

  @ForeignKey(() => Credential)
  credentialid!: number;

  @BelongsTo(() => Credential)
  credential!: Credential;

  @BelongsToMany(() => Recipient, () => RecipientIssuance)
  recipients?: Array<Recipient>;
}
