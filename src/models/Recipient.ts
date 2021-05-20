import {
  Table,
  Column,
  Unique,
  AllowNull,
  Model,
  BelongsToMany,
  IsEmail,
} from "sequelize-typescript";
import { Issuance } from "./Issuance";
import { RecipientIssuance } from "./RecipientIssuance";

@Table
export class Recipient extends Model implements Recipient {
  @AllowNull(false)
  @Column
  name!: string;

  @Unique
  @AllowNull(false)
  @IsEmail
  @Column
  email!: string;

  @Unique
  @Column
  did?: string;

  @Unique
  @Column
  externalId?: string;

  @BelongsToMany(() => Issuance, () => RecipientIssuance)
  issuance?: Array<Issuance>;
}
