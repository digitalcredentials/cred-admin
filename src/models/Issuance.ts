import {Table, Column, Model, AllowNull, BelongsToMany, ForeignKey} from 'sequelize-typescript';
import { Credential } from './Credential';
import { Recipient } from './Recipient';
import { RecipientIssuance } from './RecipientIssuance';

@Table
export class Issuance extends Model implements Issuance {

  @AllowNull(false)
  @Column
  name!: string;

  @Column
  issueDate!: Date;

  @ForeignKey(() => Credential)
  credentialid!: number;

  @BelongsToMany(() => Recipient, () => RecipientIssuance)
  recipients?: Recipient[];
}
