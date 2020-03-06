import Sequelize from 'sequelize';

export default class Temp extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        idx: {
          type: Sequelize.INTEGER(11),
          autoIncrement: true,
          primaryKey: true,
        },
        title: { type: Sequelize.STRING(100) },
        thumbnail: { type: Sequelize.STRING(200) },
        contents: { type: Sequelize.TEXT('medium') },
      },
      {
        tableName: 'temp',
        sequelize,
      },
    );
  }

  // eslint-disable-next-line no-unused-vars
  static associate(models) {}

  static selectByTitle(title) {
    return async transaction => {
      return await this.findOne({ where: { title }, transaction });
    };
  }
}
