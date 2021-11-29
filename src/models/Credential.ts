import {
  Table,
  Column,
  DataType,
  AllowNull,
  Model,
  ForeignKey,
  HasMany,
  BelongsTo,
} from "sequelize-typescript";
import { Group } from "./Group";
import { Issuance } from "./Issuance";

@Table
export class Credential extends Model implements Credential {
  @AllowNull(false)
  @Column
  title!: string;

  @Column
  templatePath!: string;

  @Column(DataType.JSONB)
  templateValues!: Record<string, string>;

  @ForeignKey(() => Group)
  @Column
  groupid!: number;

  @BelongsTo(() => Group)
  group!: Group;

  @HasMany(() => Issuance)
  issuances?: Array<Issuance>;
}
