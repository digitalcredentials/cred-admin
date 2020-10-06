import {Table, Column, Model, Unique, ForeignKey, Default} from 'sequelize-typescript';
import { Recipient } from './Recipient';
import { Issuance } from './Issuance';

@Table
export class RecipientIssuance extends Model implements RecipientIssuance {

  @Column
  @Default({value: false})
  isIssued?: boolean;

  @Column
  issuedAt?: Date;

  @Column
  @Default({value: false})
  isApproved?: boolean;

  @Column
  approvedAt?: Date;

  @Column
  @Unique
  awardId?: string;

  @ForeignKey(() => Recipient)
  recipient!: Recipient;

  @ForeignKey(() => Issuance)
  issuance!: Issuance[];
}
