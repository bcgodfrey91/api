import { baseModel } from '../models'

module.exports = (Sequelize, DataTypes) => {
    const Model = Sequelize.define('Currency', {
        id: {
            type: DataTypes.TEXT,
            required: true,
            primaryKey: true
        },
        symbol: {
            type: DataTypes.TEXT
        },
        name: {
            type: DataTypes.TEXT
        },
        price_updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        history_minute_updated_at: {
            type: DataTypes.DATE
        },
        history_hour_updated_at: {
            type: DataTypes.DATE
        },
        history_day_updated_at: {
            type: DataTypes.DATE
        }
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'Currencies'
    })

    Model.associate = (models) => {
        models.Currency.hasOne(models.Price, {
            as: 'price',
            foreignKey: 'currency_id'
        })
    }

    Model.hasPrimaryKey = baseModel.hasPrimaryKey
    Model.bulkUpsert = baseModel.bulkUpsert

    return Model
}
