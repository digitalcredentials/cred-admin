import {Table, Column, DataType, AllowNull, Model, BelongsTo, HasMany} from 'sequelize-typescript';
import { Group } from './Group';
import { Issuance } from './Issuance';

@Table
export class Credential extends Model implements Credential {

  @Column
  @AllowNull(false)
  title!: string;

  @Column(DataType.TEXT)
  description!: string;

  @BelongsTo(() => Group)
  group!: Group;

  @HasMany(() => Issuance)
  issuances?: Issuance[];
}
