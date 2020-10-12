import {
  Table,
  Column,
  AllowNull,
  Unique,
  Model,
  BelongsToMany,
} from "sequelize-typescript";
import { Group } from "./Group";
import { UserGroup } from "./UserGroup";

@Table
export class User extends Model implements User {
  @Unique
  @AllowNull(false)
  @Column
  name!: string;

  @Column
  isAdmin!: boolean;

  @Unique
  @AllowNull(false)
  @Column
  apiToken!: string;

  @BelongsToMany(() => Group, () => UserGroup)
  groups?: Array<Group>;
}
