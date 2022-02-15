import { Sequelize } from 'sequelize';
import { AutoIncrement, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ freezeTableName: true })
export class ServiceTag extends Model<ServiceTag> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceTagID: number;

	@Column(DataType.STRING)
	serviceTagName: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
