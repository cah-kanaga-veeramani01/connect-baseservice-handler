import { Sequelize } from 'sequelize';
import { AutoIncrement, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript';

@Table({ freezeTableName: true })
export class BulkServiceAttributesStatus extends Model<BulkServiceAttributesStatus> {
	@AutoIncrement
	@PrimaryKey
	@Column(DataType.INTEGER)
	bulkServiceAttributesStatusID: number;

	@Column(DataType.STRING)
	fileName: string;

	@Column(DataType.INTEGER)
	totalRecords: number;

	@Column(DataType.INTEGER)
	successfullyProcessedRecords: number;

	@Column(DataType.INTEGER)
	totalFailedRecords: number;

	@Column(DataType.JSONB)
	errorReason: JSON;

	@Column(DataType.STRING)
	filelocation: string;

	@Column(DataType.STRING)
	status: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) createdAt: Date;

	@Column(DataType.STRING) createdBy: string;

	@Default(Sequelize.fn('now')) @Column(DataType.DATE) updatedAt: Date;

	@Column(DataType.STRING) updatedBy: string;
}
