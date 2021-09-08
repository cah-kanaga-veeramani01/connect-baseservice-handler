import { Sequelize } from 'sequelize';
import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { BaseService } from './BaseService';
import { ServiceModule } from './ServiceModule';

@Table
export class ServiceConfigAuditLogs extends Model<ServiceConfigAuditLogs> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceLogID: number;

	@ForeignKey(() => BaseService)
	@Column(DataType.INTEGER)
	serviceID: number;
	@BelongsTo(() => BaseService)
	service: BaseService;

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
