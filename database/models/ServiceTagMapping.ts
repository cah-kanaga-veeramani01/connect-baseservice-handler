import { Sequelize } from 'sequelize';
import { AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Service } from './Service';
import { ServiceTag } from './ServiceTag';

@Table({ freezeTableName: true })
export class ServiceTagMapping extends Model<ServiceTagMapping> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	serviceTagMappingID: number;

	@BelongsTo(() => Service)
	service: Service;
	@ForeignKey(() => Service)
	@Column(DataType.INTEGER)
	serviceID: number;

	@BelongsTo(() => ServiceTag)
	serviceTag: ServiceTag;
	@ForeignKey(() => ServiceTag)
	@Column(DataType.INTEGER)
	serviceTagID: number;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
