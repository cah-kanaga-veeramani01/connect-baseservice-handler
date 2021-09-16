import { Sequelize } from 'sequelize';
import { AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ServiceType } from './ServiceType';

@Table({ freezeTableName: true })
export class ServiceClass extends Model<ServiceClass> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceClassID: number;

	@Column(DataType.STRING)
	serviceClassName: string;

	@ForeignKey(() => ServiceType)
	@Column(DataType.INTEGER)
	serviceTypeID: number;
	@BelongsTo(() => ServiceType)
	serviceType: ServiceType;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
