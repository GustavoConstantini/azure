import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      sexo: Yup.string().required(),
      bio: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(1),
    });

    const { sexo } = req.body;


    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails ' });
    }

    if (sexo.toUpperCase() !== 'F' && sexo.toUpperCase() !== 'M') {
      return res.status(400).json({ error: 'validation fails ' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exits' });
    }
    const {
      id, name, bio, email, admin,
    } = await User.create(req.body);

    return res.json({
      id, name, sexo, bio, email, admin,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      name: Yup.string(),
      sexo: Yup.string(),
      bio: Yup.string(),
      oldPassword: Yup.string().min(1),
      password: Yup.string()
        .min(1)
        .when('oldPassword', (oldPassword, field) => (oldPassword ? field.required() : field)),
      confirmPassword: Yup.string().when('password', (password, field) => (password ? field.required().oneOf([Yup.ref('password')]) : field)),
    });

    const { sexo } = req.body;

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails ' });
    }

    if (sexo) {
      if (sexo.toUpperCase() !== 'F' && sexo.toUpperCase() !== 'M') {
        return res.status(400).json({ error: 'validation fails ' });
      }
    }
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists ' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match ' });
    }

    const {
      id, name, bio, admin,
    } = await user.update(req.body);

    return res.json({
      id, name, sexo, bio, email, admin,
    });
  }
}

export default new UserController();
