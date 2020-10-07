import {Table, Column, AllowNull, Unique, Model, BelongsToMany} from 'sequelize-typescript';
import { Group } from './Group';
import { UserGroup } from './UserGroup';

@Table
export class User extends Model implements User {

  @Column
  @Unique
  @AllowNull(false)
  name!: string;

  @Column
  isAdmin!: boolean;

  @Column
  apiToken?: string;

  @BelongsToMany(() => Group, () => UserGroup)
  groups?: Group[];
}
