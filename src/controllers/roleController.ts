import { Response } from 'express';
import { Role, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllRoles = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json({ data: roles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoleById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, permissions } = req.body;

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
      userCount: 0,
    });

    res.status(201).json({
      id: role.id,
      name: role.name,
      message: 'Role created successfully',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findByPk(id);

    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    await role.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(permissions && { permissions }),
    });

    res.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);

    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    // Check if role is in use
    const userCount = await User.count({ where: { roleId: id } });
    
    if (userCount > 0) {
      res.status(400).json({
        error: 'Role in use',
        message: `Cannot delete role. ${userCount} user(s) are assigned to this role`,
      });
      return;
    }

    await role.destroy();

    res.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
