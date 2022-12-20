import { Table, Column, Model, AllowNull, DataType, Default, Sequelize, ForeignKey, BelongsTo, AutoIncrement, PrimaryKey } from 'sequelize-typescript';
import { Service } from './Service';
import { ServiceModule } from './ServiceModule';

@Table({ freezeTableName: true, schema: 'program' })
export class ServiceModuleConfig extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column
	programModuleConfigID: number;

	@AllowNull(false)
	@ForeignKey(() => Service)
	@Column
	serviceID: number;

	@AllowNull(false)
	@ForeignKey(() => ServiceModule)
	@Column
	moduleID: number;

	@ForeignKey(() => Service)
	@Column
	moduleVersion: number;

	@BelongsTo(() => Service)
	globalServiceVersion: Service;

	@Column
	status: string;

	@Default(Sequelize.fn('now')) @Column createdAt: Date;

	@Column(DataType.STRING(100)) createdBy: string;
}
