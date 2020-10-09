import {Table, Column, Unique, AllowNull, Model, BelongsToMany, BelongsTo} from 'sequelize-typescript';
import { Issuance } from './Issuance';
import { RecipientIssuance } from './RecipientIssuance';

@Table
export class Recipient extends Model implements Recipient {

  @AllowNull(false)
  @Column
  name!: string;

  @Unique
  @AllowNull(false)
  @Column
  email!: string;

  @Unique
  @Column
  did?: string;

  @Unique
  @Column
  externalId?: string;

  @BelongsToMany(() => Issuance, () => RecipientIssuance)
  issuance?: Issuance[];
}
