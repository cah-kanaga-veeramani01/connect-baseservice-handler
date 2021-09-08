import { Sequelize } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Service } from './Service';
import { ServiceModule } from './ServiceModule';

@Table
export class ServiceAuditLogs extends Model<ServiceAuditLogs> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceLogID: number;

	@ForeignKey(() => Service)
	@Column(DataType.INTEGER)
	serviceID: number;
	@BelongsTo(() => Service)
	service: Service;

	@ForeignKey(() => ServiceModule)
	@Column(DataType.INTEGER)
	moduleID: number;
	@BelongsTo(() => ServiceModule)
	serviceModule: ServiceModule;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	globalServiceVersion: number;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	moduleVersion: number;

	@Column(DataType.DATE)
	validFrom: Date;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
