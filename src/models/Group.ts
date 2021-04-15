import {
  Table,
  Column,
  DataType,
  AllowNull,
  Unique,
  Model,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import { Credential } from "./Credential";
import { User } from "./User";
import { UserGroup } from "./UserGroup";
import { DIDDocument } from "../types";

@Table
export class Group extends Model implements Group {
  @Unique
  @AllowNull(false)
  @Column
  name!: string;

  @AllowNull(false)
  @Column(DataType.JSONB)
  didDoc!: DIDDocument;

  @AllowNull(false)
  @Column
  didKeyId!: string;

  @BelongsToMany(() => User, () => UserGroup)
  users?: Array<User>;

  @HasMany(() => Credential)
  credentials?: Array<Credential>;
}
