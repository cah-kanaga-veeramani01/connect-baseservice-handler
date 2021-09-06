import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ freezeTableName: true })
export class Service extends Model<Service> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceID: number;

	@Column(DataType.STRING)
	serviceName: string;

	@Column(DataType.STRING)
	serviceType: string;
}
