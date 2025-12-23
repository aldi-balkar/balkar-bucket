import { Response } from 'express';
import { User, Role } from '../models';
import { AuthRequest } from '../middleware/auth';
import { getPagination, getPaginationData } from '../utils/helpers';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const { limit: queryLimit, offset } = getPagination(page, limit);

    const where: any = {};
    
    if (role) where.roleId = role;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: queryLimit,
      offset,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
        },
      ],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: users,
      pagination: getPaginationData(count, page, limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'permissions'],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, roleId } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      status: 'active',
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      message: 'User created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, status, avatar } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (roleId) updateData.roleId = roleId;
    if (status) updateData.status = status;
    if (avatar) updateData.avatar = avatar;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await user.update(updateData);

    res.json({ message: 'User updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
