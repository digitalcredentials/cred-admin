import {
  Table,
  Column,
  DataType,
  AllowNull,
  Model,
  ForeignKey,
  HasMany,
} from "sequelize-typescript";
import { Group } from "./Group";
import { Issuance } from "./Issuance";

@Table
export class Credential extends Model implements Credential {
  @AllowNull(false)
  @Column
  title!: string;

  @Column(DataType.JSONB)
  template!: Record<string, unknown>;

  @ForeignKey(() => Group)
  @Column
  groupid!: number;

  @HasMany(() => Issuance)
  issuances?: Array<Issuance>;
}
