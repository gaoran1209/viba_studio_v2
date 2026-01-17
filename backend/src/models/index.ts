import { User } from './User';
import { GenerationHistory } from './GenerationHistory';

// Define associations
User.hasMany(GenerationHistory, { foreignKey: 'user_id', as: 'generations' });
GenerationHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export { User, GenerationHistory };
