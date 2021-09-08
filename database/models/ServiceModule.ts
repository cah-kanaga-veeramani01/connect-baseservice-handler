import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ freezeTableName: true })
export class ServiceModule extends Model<ServiceModule> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	moduleID: number;

	@Column(DataType.STRING)
	moduleName: string;
}
