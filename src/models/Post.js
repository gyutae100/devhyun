import Sequelize from 'sequelize';

export default class Post extends Sequelize.Model {
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
        hit: { type: Sequelize.INTEGER(11) },
      },
      {
        sequelize,
      },
    );
  }

  // eslint-disable-next-line no-unused-vars
  static associate(models) {}

  // 메인화면에 제공하는 최신글 조회
  static async selectLatest(limit = 5, transaction) {
    return await this.findAll({
      order: [['idx', 'desc']],
      limit,
      transaction,
    });
  }
}
