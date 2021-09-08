import { Sequelize } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { ServiceClass } from './ServiceClass';
import { ServiceType } from './ServiceType';

@Table({ freezeTableName: true })
export class Service extends Model<Service> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceID: number;

	@Column(DataType.STRING)
	serviceName: string;

	@Column(DataType.STRING)
	serviceDisplayName: string;

	@PrimaryKey
	@Column(DataType.INTEGER)
	globalServiceVersion: number;

	@Column(DataType.DATE)
	validFrom: Date;

	@Column(DataType.DATE)
	validTill: Date;

	@AllowNull(false)
	@Column(DataType.BOOLEAN)
	isPublished: boolean;

	@ForeignKey(() => ServiceClass)
	@Column(DataType.INTEGER)
	serviceClassID: number;
	@BelongsTo(() => ServiceClass)
	serviceClass: ServiceClass;

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
