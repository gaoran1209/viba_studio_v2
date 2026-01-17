import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum GenerationType {
  DERIVATION = 'derivation',
  AVATAR = 'avatar',
  TRY_ON = 'try_on',
  SWAP = 'swap',
}

export enum GenerationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class GenerationHistory extends Model {
  public id!: string;
  public user_id!: string;
  public type!: GenerationType;
  public status!: GenerationStatus;
  public input_files!: any; // JSONB
  public output_files!: any; // JSONB
  public parameters!: any; // JSONB
  public error_message!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

GenerationHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(GenerationType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GenerationStatus)),
      defaultValue: GenerationStatus.PENDING,
    },
    input_files: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    output_files: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    parameters: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'generation_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
