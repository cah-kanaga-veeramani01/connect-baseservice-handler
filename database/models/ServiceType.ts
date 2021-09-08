import { Sequelize } from 'sequelize';
import { AutoIncrement, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ freezeTableName: true })
export class ServiceType extends Model<ServiceType> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceTypeID: number;

	@Column(DataType.STRING)
	serviceType: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
