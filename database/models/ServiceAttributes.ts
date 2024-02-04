import { AllowNull, AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Service } from './Service';

@Table({ freezeTableName: true })
export class ServiceAttributes extends Model {
	@AllowNull(false)
	@AutoIncrement
	@PrimaryKey
	@Column
	serviceAttributesID: number;

	@Column(DataType.JSON)
	metadata;

	@ForeignKey(() => Service)
	@Column
	serviceID: number;

	@ForeignKey(() => Service)
	@Column
	globalServiceVersion: number;

	// @Default(Sequelize.fn('now')) @Column createdAt: Date;

	@Column(DataType.STRING(100)) createdBy: string;

	// @Default(Sequelize.fn('now')) @Column updatedAt: Date;

	@Column(DataType.STRING(100)) updatedBy: string;
}
