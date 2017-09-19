import { baseModel } from '../models'

module.exports = (Sequelize, DataTypes) => {
    const Model = Sequelize.define('Price', {
        currency_id: {
            type: DataTypes.TEXT,
            allowNull: false,
            references: {
                model: 'Currencies',
                key: 'id'
            },
            required: true,
            primaryKey: true
        },
        current: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        supply: {
            type: DataTypes.BIGINT
        },
        volume_day: {
            type: DataTypes.BIGINT
        },
        market_cap: {
            type: DataTypes.BIGINT
        },
        change_hour: {
            type: DataTypes.DECIMAL
        },
        change_day: {
            type: DataTypes.DECIMAL
        },
        change_week: {
            type: DataTypes.DECIMAL
        },
        change_month: {
            type: DataTypes.DECIMAL
        }
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'Prices'
    })

    // Build relations between this model and others
    Model.associate = (models) => {

    }

    Model.hasPrimaryKey = baseModel.hasPrimaryKey
    Model.bulkUpsert = baseModel.bulkUpsert

    return Model
}
