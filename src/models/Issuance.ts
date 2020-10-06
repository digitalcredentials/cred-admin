import {Table, Column, Model, AllowNull, BelongsToMany, BelongsTo} from 'sequelize-typescript';
import { Credential } from './Credential';
import { Recipient } from './Recipient';
import { RecipientIssuance } from './RecipientIssuance';

@Table
export class Issuance extends Model implements Issuance {

  @Column
  @AllowNull(false)
  name!: string;

  @Column
  issueDate!: Date;

  @BelongsTo(() => Credential)
  credential!: Credential;

  @BelongsToMany(() => Recipient, () => RecipientIssuance)
  recipients?: Recipient[];
}
