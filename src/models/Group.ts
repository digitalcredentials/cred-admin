import {Table, Column, AllowNull, Unique, Model, BelongsToMany, HasMany} from 'sequelize-typescript';
import { Credential } from './Credential';
import { User } from './User';
import { UserGroup } from './UserGroup';

@Table
export class Group extends Model implements Group {

  @Unique
  @AllowNull(false)
  @Column
  name!: string;

  @BelongsToMany(() => User, () => UserGroup)
  users?: User[];

  @HasMany(() => Credential)
  credentials?: Credential[];
}
