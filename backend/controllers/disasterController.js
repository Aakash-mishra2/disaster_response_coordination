import { DisasterModel } from '../models.js';
import { io } from '../socket.js';

export const createDisaster = async (req, res) => {
  try {
    const { title, location_name, description, tags, owner_id } = req.body;
    const disaster = {
      title,
      location_name,
      description,
      tags,
      owner_id,
      created_at: new Date().toISOString(),
      audit_trail: [{ action: 'create', user_id: owner_id, timestamp: new Date().toISOString() }]
    };
    const { data, error } = await DisasterModel.create(disaster);
    if (error) return res.status(400).json({ error });
    io.emit('disaster_updated', { type: 'create', disaster: data[0] });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDisasters = async (req, res) => {
  try {
    const { tag } = req.query;
    const { data, error } = await DisasterModel.getAll(tag ? { tag } : {});
    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!updateData.audit_trail) updateData.audit_trail = [];
    updateData.audit_trail.push({ action: 'update', user_id: updateData.owner_id, timestamp: new Date().toISOString() });
    const { data, error } = await DisasterModel.update(id, updateData);
    if (error) return res.status(400).json({ error });
    io.emit('disaster_updated', { type: 'update', disaster: data[0] });
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await DisasterModel.delete(id);
    if (error) return res.status(400).json({ error });
    io.emit('disaster_updated', { type: 'delete', id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
