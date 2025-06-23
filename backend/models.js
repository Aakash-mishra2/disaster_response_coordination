// Stubs for Supabase table access and helpers
import { supabase } from './supabaseClient.js';

export const DisasterModel = {
  async create(data) {
    return supabase.from('disasters').insert([data]);
  },
  async getAll(filter = {}) {
    let query = supabase.from('disasters').select('*');
    if (filter.tag) query = query.contains('tags', [filter.tag]);
    return query;
  },
  async update(id, data) {
    return supabase.from('disasters').update(data).eq('id', id);
  },
  async delete(id) {
    return supabase.from('disasters').delete().eq('id', id);
  }
};

export const ReportModel = {
  async create(data) {
    return supabase.from('reports').insert([data]);
  },
  // ...other CRUD methods
};

export const ResourceModel = {
  async create(data) {
    return supabase.from('resources').insert([data]);
  },
  async getNearby(disaster_id, lat, lon, radius = 10000) {
    return supabase.rpc('get_nearby_resources', {
      disaster_id,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius
    });
  }
};

export const CacheModel = {
  async get(key) {
    const { data } = await supabase.from('cache').select('*').eq('key', key).single();
    return data;
  },
  async set(key, value, expires_at) {
    return supabase.from('cache').upsert([{ key, value, expires_at }]);
  }
};
