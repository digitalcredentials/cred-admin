import {Table, Column, Unique, AllowNull, Model, BelongsToMany, BelongsTo} from 'sequelize-typescript';
import { Issuance } from './Issuance';
import { RecipientIssuance } from './RecipientIssuance';

@Table
export class Recipient extends Model implements Recipient {

  @Column
  @AllowNull(false)
  name!: string;

  @Column
  @Unique
  @AllowNull(false)
  email!: string;

  @Column
  @Unique
  did?: string;

  @Column
  @Unique
  externalId?: string;

  @BelongsToMany(() => Issuance, () => RecipientIssuance)
  issuance?: Issuance[];
}
