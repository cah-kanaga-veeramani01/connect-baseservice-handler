import { Sequelize } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ServiceType } from './ServiceType';

@Table({ freezeTableName: true })
export class ServiceTag extends Model<ServiceTag> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceTagID: number;

	@Column(DataType.STRING)
	serviceTagName: string;

	@Column(DataType.STRING)
	serviceDisplayName: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;

}
