import Sequelize from 'sequelize';

export default class Tag extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        idx: {
          type: Sequelize.INTEGER(11),
          autoIncrement: true,
          primaryKey: true,
        },
        tag: { type: Sequelize.STRING(100), unique: true },
      },
      {
        tableName: 'tag',
        timestamps: false,
        sequelize,
      },
    );
  }

  static associate(models) {
    this.belongsToMany(models.Post, {
      through: 'post_tag',
      timestamps: false,
    });
  }

  // 중복제외된 태그의 수 조회
  static countDistinct() {
    return async transaction => {
      return await this.count({ distinct: true, col: 'tag', transaction });
    };
  }
}
